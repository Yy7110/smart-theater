package com.smarttheater.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.smarttheater.common.constant.RedisKeyConstants;
import com.smarttheater.common.exception.BusinessException;
import com.smarttheater.entity.*;
import com.smarttheater.mapper.*;
import com.smarttheater.service.SeatService;
import com.smarttheater.vo.seat.SeatMapVO;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.script.DefaultRedisScript;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.*;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SeatServiceImpl implements SeatService {

    private final ShowScheduleMapper scheduleMapper;
    private final SeatMapper seatMapper;
    private final SeatMapMapper seatMapMapper;
    private final ScheduleSeatPriceMapper priceMapper;
    private final OrderItemMapper orderItemMapper;
    private final StringRedisTemplate stringRedisTemplate;

    // Lua script: atomic multi-seat lock. Returns 1 if all locked, 0 if any conflict.
    private static final String LOCK_SEATS_LUA = """
            local ttl = tonumber(ARGV[1])
            local userId = ARGV[2]
            -- Check all seats first
            for i = 1, #KEYS do
                local current = redis.call('GET', KEYS[i])
                if current and current ~= userId then
                    return 0
                end
            end
            -- All available or already owned, lock them all
            for i = 1, #KEYS do
                redis.call('SET', KEYS[i], userId, 'EX', ttl)
            end
            return 1
            """;

    private static final String UNLOCK_SEATS_LUA = """
            local userId = ARGV[1]
            local count = 0
            for i = 1, #KEYS do
                local current = redis.call('GET', KEYS[i])
                if current == userId then
                    redis.call('DEL', KEYS[i])
                    count = count + 1
                end
            end
            return count
            """;

    @Override
    public SeatMapVO getSeatMap(Long scheduleId) {
        ShowSchedule schedule = scheduleMapper.selectById(scheduleId);
        if (schedule == null) throw new BusinessException("场次不存在");
        if (schedule.getSeatMapId() == null) throw new BusinessException("该场次未配置座位图");

        SeatMap seatMap = seatMapMapper.selectById(schedule.getSeatMapId());
        if (seatMap == null) throw new BusinessException("座位图不存在");

        // All seats for this seat map
        List<Seat> seats = seatMapper.selectList(
                new LambdaQueryWrapper<Seat>()
                        .eq(Seat::getSeatMapId, seatMap.getId())
                        .orderByAsc(Seat::getRowNum, Seat::getColNum));

        // Get sold seat IDs for this schedule
        List<OrderItem> soldItems = orderItemMapper.selectList(
                new LambdaQueryWrapper<OrderItem>()
                        .eq(OrderItem::getScheduleId, scheduleId)
                        .in(OrderItem::getTicketStatus, "VALID", "VERIFIED"));
        Set<Long> soldSeatIds = soldItems.stream()
                .map(OrderItem::getSeatId).collect(Collectors.toSet());

        // Get prices for this schedule
        List<ScheduleSeatPrice> prices = priceMapper.selectList(
                new LambdaQueryWrapper<ScheduleSeatPrice>()
                        .eq(ScheduleSeatPrice::getScheduleId, scheduleId));
        Map<String, BigDecimal> priceMap = prices.stream()
                .collect(Collectors.toMap(ScheduleSeatPrice::getSeatType, ScheduleSeatPrice::getPrice));

        // Build seat map VO
        SeatMapVO vo = new SeatMapVO();
        vo.setSeatMapId(seatMap.getId());
        vo.setSeatMapName(seatMap.getName());
        vo.setTotalRows(seatMap.getTotalRows());

        // Group seats by row
        Map<Integer, List<Seat>> rowMap = seats.stream()
                .collect(Collectors.groupingBy(Seat::getRowNum, TreeMap::new, Collectors.toList()));

        List<SeatMapVO.SeatRow> rows = new ArrayList<>();
        for (Map.Entry<Integer, List<Seat>> entry : rowMap.entrySet()) {
            SeatMapVO.SeatRow row = new SeatMapVO.SeatRow();
            row.setRowNum(entry.getKey());
            row.setSeats(entry.getValue().stream().map(seat -> {
                SeatMapVO.SeatInfo info = new SeatMapVO.SeatInfo();
                info.setSeatId(seat.getId());
                info.setRowNum(seat.getRowNum());
                info.setColNum(seat.getColNum());
                info.setSeatLabel(seat.getSeatLabel());
                info.setSeatType(seat.getSeatType());
                info.setPrice(priceMap.getOrDefault(seat.getSeatType(), BigDecimal.ZERO));

                if (seat.getStatus() != 1) {
                    info.setStatus("UNAVAILABLE");
                } else if (soldSeatIds.contains(seat.getId())) {
                    info.setStatus("SOLD");
                } else {
                    // Check Redis lock
                    String lockKey = RedisKeyConstants.seatLockKey(scheduleId, seat.getId());
                    String lockVal = stringRedisTemplate.opsForValue().get(lockKey);
                    info.setStatus(lockVal != null ? "LOCKED" : "AVAILABLE");
                }
                return info;
            }).collect(Collectors.toList()));
            rows.add(row);
        }
        vo.setRows(rows);

        vo.setPrices(prices.stream().map(p -> {
            SeatMapVO.SeatPriceInfo pi = new SeatMapVO.SeatPriceInfo();
            pi.setSeatType(p.getSeatType());
            pi.setPrice(p.getPrice());
            return pi;
        }).collect(Collectors.toList()));

        return vo;
    }

    @Override
    public boolean lockSeats(Long scheduleId, List<Long> seatIds, Long userId) {
        if (seatIds == null || seatIds.isEmpty()) throw new BusinessException("请选择座位");
        if (seatIds.size() > 6) throw new BusinessException("单次最多选择6个座位");

        // Verify all seats exist and are valid
        List<Seat> seats = seatMapper.selectBatchIds(seatIds);
        if (seats.size() != seatIds.size()) throw new BusinessException("部分座位不存在");

        // Check if any seat is already sold
        Long soldCount = orderItemMapper.selectCount(
                new LambdaQueryWrapper<OrderItem>()
                        .eq(OrderItem::getScheduleId, scheduleId)
                        .in(OrderItem::getSeatId, seatIds)
                        .in(OrderItem::getTicketStatus, "VALID", "VERIFIED"));
        if (soldCount > 0) throw new BusinessException("部分座位已售出");

        // Atomic Redis lock
        List<String> keys = seatIds.stream()
                .map(seatId -> RedisKeyConstants.seatLockKey(scheduleId, seatId))
                .collect(Collectors.toList());

        DefaultRedisScript<Long> script = new DefaultRedisScript<>(LOCK_SEATS_LUA, Long.class);
        Long result = stringRedisTemplate.execute(script, keys,
                String.valueOf(RedisKeyConstants.SEAT_LOCK_TTL),
                String.valueOf(userId));

        if (result == null || result == 0) {
            throw new BusinessException("部分座位已被他人锁定，请重新选择");
        }
        return true;
    }

    @Override
    public boolean unlockSeats(Long scheduleId, List<Long> seatIds, Long userId) {
        if (seatIds == null || seatIds.isEmpty()) return true;

        List<String> keys = seatIds.stream()
                .map(seatId -> RedisKeyConstants.seatLockKey(scheduleId, seatId))
                .collect(Collectors.toList());

        DefaultRedisScript<Long> script = new DefaultRedisScript<>(UNLOCK_SEATS_LUA, Long.class);
        stringRedisTemplate.execute(script, keys, String.valueOf(userId));
        return true;
    }
}
