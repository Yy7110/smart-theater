package com.smarttheater.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.smarttheater.common.result.Result;
import com.smarttheater.entity.*;
import com.smarttheater.mapper.*;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final ShowMapper showMapper;
    private final ShowScheduleMapper scheduleMapper;
    private final ScheduleSeatPriceMapper priceMapper;
    private final CategoryMapper categoryMapper;
    private final VenueMapper venueMapper;
    private final VenueHallMapper hallMapper;
    private final SeatMapMapper seatMapMapper;
    private final SeatMapper seatMapper;
    private final ShowImageMapper imageMapper;
    private final ShowTagMapper tagMapper;
    private final HomeConfigMapper homeConfigMapper;
    private final SysUserMapper userMapper;
    private final OrderMapper orderMapper;
    private final ContactMessageMapper messageMapper;
    private final org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;

    // === Show Management ===
    @GetMapping("/shows")
    public Result<Page<Show>> getShows(@RequestParam(defaultValue = "1") int page,
                                        @RequestParam(defaultValue = "10") int size,
                                        @RequestParam(required = false) String status,
                                        @RequestParam(required = false) String category) {
        Page<Show> p = new Page<>(page, size);
        LambdaQueryWrapper<Show> qw = new LambdaQueryWrapper<>();
        if (status != null) qw.eq(Show::getStatus, status);
        if (category != null) qw.eq(Show::getCategoryId, category);
        showMapper.selectPage(p, qw);
        return Result.success(p);
    }

    @GetMapping("/shows/{id}")
    public Result<Show> getShow(@PathVariable Long id) {
        Show show = showMapper.selectById(id);
        return show != null ? Result.success(show) : Result.error("演出不存在");
    }

    @PostMapping("/shows")
    public Result<Show> createShow(@RequestBody Map<String, Object> body) {
        Show show = new Show();
        show.setTitle((String) body.get("title"));
        show.setCategoryId(Long.valueOf(body.get("categoryId").toString()));
        show.setVenueId(Long.valueOf(body.get("venueId").toString()));
        if (body.get("venueHallId") != null) show.setVenueHallId(Long.valueOf(body.get("venueHallId").toString()));
        show.setArtist((String) body.get("artist"));
        show.setDescription((String) body.get("description"));
        show.setPosterUrl((String) body.get("posterUrl"));
        if (body.get("minPrice") != null && !body.get("minPrice").toString().isEmpty())
            show.setMinPrice(new BigDecimal(body.get("minPrice").toString()));
        if (body.get("maxPrice") != null && !body.get("maxPrice").toString().isEmpty())
            show.setMaxPrice(new BigDecimal(body.get("maxPrice").toString()));
        show.setStatus(body.getOrDefault("status", "DRAFT").toString());
        show.setDeleted(0);
        showMapper.insert(show);

        // Handle tags
        if (body.get("tags") instanceof List<?> tagList) {
            for (Object t : tagList) {
                ShowTag tag = new ShowTag();
                tag.setShowId(show.getId());
                tag.setTagName(t.toString());
                tagMapper.insert(tag);
            }
        }

        // Auto-create default schedule with prices
        autoCreateSchedule(show);

        return Result.success(show);
    }

    @PutMapping("/shows/{id}")
    public Result<Void> updateShow(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        if (id <= 6) return Result.error("系统预置演出不可修改");
        Show show = showMapper.selectById(id);
        if (show == null) return Result.error("演出不存在");
        if (body.containsKey("title")) show.setTitle((String) body.get("title"));
        if (body.containsKey("categoryId")) show.setCategoryId(Long.valueOf(body.get("categoryId").toString()));
        if (body.containsKey("artist")) show.setArtist((String) body.get("artist"));
        if (body.containsKey("description")) show.setDescription((String) body.get("description"));
        if (body.containsKey("posterUrl")) show.setPosterUrl((String) body.get("posterUrl"));
        if (body.containsKey("minPrice") && body.get("minPrice") != null && !body.get("minPrice").toString().isEmpty())
            show.setMinPrice(new BigDecimal(body.get("minPrice").toString()));
        if (body.containsKey("maxPrice") && body.get("maxPrice") != null && !body.get("maxPrice").toString().isEmpty())
            show.setMaxPrice(new BigDecimal(body.get("maxPrice").toString()));
        showMapper.updateById(show);
        return Result.success();
    }

    @DeleteMapping("/shows/{id}")
    public Result<Void> deleteShow(@PathVariable Long id) {
        if (id <= 6) return Result.error("系统预置演出不可删除");
        showMapper.deleteById(id);
        return Result.success();
    }

    @PutMapping("/shows/{id}/status")
    public Result<Void> updateShowStatus(@PathVariable Long id, @RequestBody Map<String, String> body) {
        if (id <= 6) return Result.error("系统预置演出不可修改");
        Show show = showMapper.selectById(id);
        if (show == null) return Result.error("演出不存在");
        show.setStatus(body.get("status"));
        showMapper.updateById(show);
        return Result.success();
    }

    private void autoCreateSchedule(Show show) {
        // Find first available seat map
        List<SeatMap> seatMaps = seatMapMapper.selectList(new LambdaQueryWrapper<SeatMap>().last("LIMIT 1"));
        if (seatMaps.isEmpty()) return;
        SeatMap sm = seatMaps.get(0);
        Long seatCount = seatMapper.selectCount(new LambdaQueryWrapper<Seat>()
                .eq(Seat::getSeatMapId, sm.getId()).eq(Seat::getStatus, 1));

        // Create 2 schedules: 7 days and 14 days from now
        for (int offset : new int[]{7, 14}) {
            ShowSchedule s = new ShowSchedule();
            s.setShowId(show.getId());
            s.setSeatMapId(sm.getId());
            s.setShowDate(LocalDate.now().plusDays(offset));
            s.setShowTime(LocalTime.of(19, 30));
            s.setEndTime(LocalTime.of(21, 30));
            s.setStatus("ON_SALE");
            s.setTotalTickets(seatCount.intValue());
            s.setSoldTickets(0);
            s.setDeleted(0);
            scheduleMapper.insert(s);

            // Create 3 price tiers
            BigDecimal min = show.getMinPrice() != null ? show.getMinPrice() : new BigDecimal("100");
            BigDecimal max = show.getMaxPrice() != null ? show.getMaxPrice() : new BigDecimal("500");
            BigDecimal mid = min.add(max).divide(new BigDecimal("2"), 0, java.math.RoundingMode.HALF_UP);
            for (var entry : new Object[][]{{"VIP", max}, {"STANDARD", mid}, {"ECONOMY", min}}) {
                ScheduleSeatPrice p = new ScheduleSeatPrice();
                p.setScheduleId(s.getId());
                p.setSeatType((String) entry[0]);
                p.setPrice((BigDecimal) entry[1]);
                p.setDeleted(0);
                priceMapper.insert(p);
            }
        }
    }

    // === Schedule Management ===
    @PostMapping("/schedules")
    public Result<ShowSchedule> createSchedule(@RequestBody Map<String, Object> body) {
        ShowSchedule s = new ShowSchedule();
        s.setShowId(Long.valueOf(body.get("showId").toString()));
        if (body.get("seatMapId") != null) s.setSeatMapId(Long.valueOf(body.get("seatMapId").toString()));
        s.setShowDate(LocalDate.parse(body.get("showDate").toString()));
        s.setShowTime(LocalTime.parse(body.get("showTime").toString()));
        if (body.get("endTime") != null) s.setEndTime(LocalTime.parse(body.get("endTime").toString()));
        s.setStatus("ON_SALE");
        // Calculate total tickets from seat map
        if (s.getSeatMapId() != null) {
            Long count = seatMapper.selectCount(new LambdaQueryWrapper<Seat>()
                    .eq(Seat::getSeatMapId, s.getSeatMapId()).eq(Seat::getStatus, 1));
            s.setTotalTickets(count.intValue());
        } else {
            s.setTotalTickets(Integer.parseInt(body.getOrDefault("totalTickets", "0").toString()));
        }
        s.setSoldTickets(0);
        s.setDeleted(0);
        scheduleMapper.insert(s);
        return Result.success(s);
    }

    @PostMapping("/schedules/{id}/prices")
    public Result<Void> setSchedulePrices(@PathVariable Long id, @RequestBody List<Map<String, Object>> prices) {
        // Delete existing prices
        priceMapper.delete(new LambdaQueryWrapper<ScheduleSeatPrice>()
                .eq(ScheduleSeatPrice::getScheduleId, id));
        for (Map<String, Object> p : prices) {
            ScheduleSeatPrice price = new ScheduleSeatPrice();
            price.setScheduleId(id);
            price.setSeatType(p.get("seatType").toString());
            price.setPrice(new BigDecimal(p.get("price").toString()));
            price.setDeleted(0);
            priceMapper.insert(price);
        }
        return Result.success();
    }

    // === Seat Map Management ===
    @PostMapping("/seat-maps")
    public Result<SeatMap> createSeatMap(@RequestBody Map<String, Object> body) {
        SeatMap sm = new SeatMap();
        sm.setVenueHallId(Long.valueOf(body.get("venueHallId").toString()));
        sm.setName((String) body.get("name"));
        sm.setTotalRows(Integer.parseInt(body.get("totalRows").toString()));
        sm.setDescription((String) body.get("description"));
        sm.setDeleted(0);
        seatMapMapper.insert(sm);

        // Generate seats if rows config provided
        if (body.get("rows") instanceof List<?> rows) {
            for (Object rowObj : rows) {
                @SuppressWarnings("unchecked")
                Map<String, Object> row = (Map<String, Object>) rowObj;
                int rowNum = Integer.parseInt(row.get("rowNum").toString());
                int cols = Integer.parseInt(row.get("cols").toString());
                String seatType = row.getOrDefault("seatType", "STANDARD").toString();
                for (int col = 1; col <= cols; col++) {
                    Seat seat = new Seat();
                    seat.setSeatMapId(sm.getId());
                    seat.setRowNum(rowNum);
                    seat.setColNum(col);
                    seat.setSeatLabel(rowNum + "排" + col + "座");
                    seat.setSeatType(seatType);
                    seat.setStatus(1);
                    seat.setDeleted(0);
                    seatMapper.insert(seat);
                }
            }
        }
        return Result.success(sm);
    }

    @GetMapping("/seat-maps/{id}")
    public Result<Map<String, Object>> getSeatMapDetail(@PathVariable Long id) {
        SeatMap sm = seatMapMapper.selectById(id);
        List<Seat> seats = seatMapper.selectList(new LambdaQueryWrapper<Seat>()
                .eq(Seat::getSeatMapId, id).orderByAsc(Seat::getRowNum, Seat::getColNum));
        return Result.success(Map.of("seatMap", sm, "seats", seats));
    }

    // === Home Config ===
    @GetMapping("/home-config")
    public Result<List<HomeConfig>> getHomeConfigs() {
        return Result.success(homeConfigMapper.selectList(
                new LambdaQueryWrapper<HomeConfig>().orderByAsc(HomeConfig::getConfigType, HomeConfig::getSortOrder)));
    }

    @PostMapping("/home-config")
    public Result<HomeConfig> addHomeConfig(@RequestBody Map<String, Object> body) {
        HomeConfig hc = new HomeConfig();
        hc.setConfigType(body.get("configType").toString());
        hc.setShowId(Long.valueOf(body.get("showId").toString()));
        hc.setSortOrder(Integer.parseInt(body.getOrDefault("sortOrder", "0").toString()));
        hc.setStatus(1);
        hc.setDeleted(0);
        homeConfigMapper.insert(hc);
        return Result.success(hc);
    }

    @DeleteMapping("/home-config/{id}")
    public Result<Void> removeHomeConfig(@PathVariable Long id) {
        homeConfigMapper.deleteById(id);
        return Result.success();
    }

    // === Category Management ===
    @GetMapping("/categories")
    public Result<List<Category>> getCategories() {
        return Result.success(categoryMapper.selectList(
                new LambdaQueryWrapper<Category>().orderByAsc(Category::getSortOrder)));
    }

    @PostMapping("/categories")
    public Result<Category> createCategory(@RequestBody Category category) {
        category.setDeleted(0);
        categoryMapper.insert(category);
        return Result.success(category);
    }

    @PutMapping("/categories/{id}")
    public Result<Void> updateCategory(@PathVariable Long id, @RequestBody Category category) {
        category.setId(id);
        categoryMapper.updateById(category);
        return Result.success();
    }

    @DeleteMapping("/categories/{id}")
    public Result<Void> deleteCategory(@PathVariable Long id) {
        categoryMapper.deleteById(id);
        return Result.success();
    }

    // === Venue Management ===
    @GetMapping("/venues")
    public Result<List<Venue>> getVenues() {
        return Result.success(venueMapper.selectList(null));
    }

    @PostMapping("/venues")
    public Result<Venue> createVenue(@RequestBody Venue venue) {
        venue.setDeleted(0);
        venueMapper.insert(venue);
        return Result.success(venue);
    }

    @GetMapping("/venues/{id}")
    public Result<Venue> getVenue(@PathVariable Long id) {
        Venue venue = venueMapper.selectById(id);
        return venue != null ? Result.success(venue) : Result.error("场馆不存在");
    }

    @PutMapping("/venues/{id}")
    public Result<Void> updateVenue(@PathVariable Long id, @RequestBody Venue venue) {
        venue.setId(id);
        venueMapper.updateById(venue);
        return Result.success();
    }

    @DeleteMapping("/venues/{id}")
    public Result<Void> deleteVenue(@PathVariable Long id) {
        venueMapper.deleteById(id);
        return Result.success();
    }

    @PostMapping("/venues/{venueId}/halls")
    public Result<VenueHall> createHall(@PathVariable Long venueId, @RequestBody VenueHall hall) {
        hall.setVenueId(venueId);
        hall.setDeleted(0);
        hallMapper.insert(hall);
        return Result.success(hall);
    }

    // === User Management ===
    @GetMapping("/users")
    public Result<Page<SysUser>> getUsers(
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "20") Integer size,
            @RequestParam(required = false) String role) {
        Page<SysUser> p = new Page<>(page, size);
        LambdaQueryWrapper<SysUser> qw = new LambdaQueryWrapper<>();
        qw.eq(SysUser::getDeleted, 0);
        if (role != null) qw.eq(SysUser::getRole, role);
        qw.orderByDesc(SysUser::getCreateTime);
        return Result.success(userMapper.selectPage(p, qw));
    }

    @PutMapping("/users/{id}/status")
    public Result<Void> updateUserStatus(@PathVariable Long id, @RequestBody Map<String, Integer> body) {
        SysUser user = userMapper.selectById(id);
        if (user == null) return Result.error("用户不存在");
        user.setStatus(body.get("status"));
        userMapper.updateById(user);
        return Result.success();
    }

    // === Orders ===
    @GetMapping("/orders")
    public Result<Page<Order>> getOrders(
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "20") Integer size) {
        Page<Order> p = new Page<>(page, size);
        return Result.success(orderMapper.selectPage(p,
                new LambdaQueryWrapper<Order>().orderByDesc(Order::getCreateTime)));
    }

    // === Messages ===
    @GetMapping("/messages")
    public Result<Page<ContactMessage>> getMessages(
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "20") Integer size) {
        Page<ContactMessage> p = new Page<>(page, size);
        return Result.success(messageMapper.selectPage(p,
                new LambdaQueryWrapper<ContactMessage>().orderByDesc(ContactMessage::getCreateTime)));
    }

    @PutMapping("/messages/{id}/read")
    public Result<Void> markAsRead(@PathVariable Long id) {
        ContactMessage msg = messageMapper.selectById(id);
        if (msg != null) {
            msg.setIsRead(1);
            messageMapper.updateById(msg);
        }
        return Result.success();
    }

    @PutMapping("/messages/{id}/reply")
    public Result<Void> replyMessage(@PathVariable Long id, @RequestBody Map<String, String> body) {
        ContactMessage msg = messageMapper.selectById(id);
        if (msg == null) return Result.error("留言不存在");
        msg.setReply(body.get("reply"));
        msg.setIsRead(1);
        messageMapper.updateById(msg);
        return Result.success();
    }

    // === Stats ===
    @GetMapping("/stats")
    public Result<Map<String, Object>> getStats() {
        long totalUsers = userMapper.selectCount(new LambdaQueryWrapper<SysUser>().eq(SysUser::getDeleted, 0));
        long totalShows = showMapper.selectCount(null);
        long totalOrders = orderMapper.selectCount(null);
        BigDecimal totalRevenue = orderMapper.selectList(
            new LambdaQueryWrapper<Order>().eq(Order::getStatus, "PAID")
        ).stream().map(Order::getTotalAmount).reduce(BigDecimal.ZERO, BigDecimal::add);
        return Result.success(Map.of(
            "totalUsers", totalUsers,
            "totalShows", totalShows,
            "totalOrders", totalOrders,
            "totalRevenue", totalRevenue
        ));
    }

    @GetMapping("/orders/{id}")
    public Result<Order> getOrder(@PathVariable Long id) {
        Order order = orderMapper.selectById(id);
        return order != null ? Result.success(order) : Result.error("订单不存在");
    }

    @PostMapping("/users")
    public Result<SysUser> createUser(@RequestBody Map<String, Object> body) {
        String username = (String) body.get("username");
        Long count = userMapper.selectCount(new LambdaQueryWrapper<SysUser>()
                .eq(SysUser::getUsername, username));
        if (count > 0) {
            return Result.error("用户名已存在");
        }
        SysUser user = new SysUser();
        user.setUsername(username);
        user.setPassword(passwordEncoder.encode((String) body.get("password")));
        user.setNickname((String) body.get("nickname"));
        user.setPhone((String) body.get("phone"));
        user.setEmail((String) body.get("email"));
        user.setRole(body.getOrDefault("role", "AUDIENCE").toString());
        user.setStatus(1);
        userMapper.insert(user);
        return Result.success(user);
    }

    @PutMapping("/users/{id}")
    public Result<Void> updateUser(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        SysUser user = userMapper.selectById(id);
        if (user == null) return Result.error("用户不存在");
        if (body.containsKey("nickname")) user.setNickname((String) body.get("nickname"));
        if (body.containsKey("phone")) user.setPhone((String) body.get("phone"));
        if (body.containsKey("email")) user.setEmail((String) body.get("email"));
        if (body.containsKey("role")) user.setRole((String) body.get("role"));
        if (body.containsKey("password")) user.setPassword(passwordEncoder.encode((String) body.get("password")));
        userMapper.updateById(user);
        return Result.success();
    }

    @DeleteMapping("/users/{id}")
    public Result<Void> deleteUser(@PathVariable Long id) {
        try {
            int result = userMapper.deleteUserById(id);
            if (result > 0) {
                return Result.success();
            } else {
                return Result.error("用户不存在");
            }
        } catch (Exception e) {
            e.printStackTrace();
            return Result.error("删除失败: " + e.getMessage());
        }
    }
}
