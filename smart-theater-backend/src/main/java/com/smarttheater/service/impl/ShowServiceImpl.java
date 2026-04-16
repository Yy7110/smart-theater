package com.smarttheater.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.smarttheater.common.enums.ShowStatus;
import com.smarttheater.common.exception.BusinessException;
import com.smarttheater.entity.*;
import com.smarttheater.mapper.*;
import com.smarttheater.service.ShowService;
import com.smarttheater.vo.show.ScheduleVO;
import com.smarttheater.vo.show.ShowDetailVO;
import com.smarttheater.vo.show.ShowListVO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ShowServiceImpl implements ShowService {

    private final ShowMapper showMapper;
    private final CategoryMapper categoryMapper;
    private final VenueMapper venueMapper;
    private final VenueHallMapper venueHallMapper;
    private final ShowScheduleMapper scheduleMapper;
    private final ScheduleSeatPriceMapper priceMapper;
    private final ShowImageMapper imageMapper;
    private final ShowTagMapper tagMapper;
    private final OrderItemMapper orderItemMapper;

    @Override
    public Page<ShowListVO> getShowList(Integer page, Integer size, String category, String keyword, String status) {
        LambdaQueryWrapper<Show> qw = new LambdaQueryWrapper<>();

        if (category != null && !category.isEmpty()) {
            Category cat = categoryMapper.selectOne(
                    new LambdaQueryWrapper<Category>().eq(Category::getName, category));
            if (cat != null) {
                qw.eq(Show::getCategoryId, cat.getId());
            }
        }
        if (keyword != null && !keyword.isEmpty()) {
            qw.and(w -> w.like(Show::getTitle, keyword)
                    .or().like(Show::getArtist, keyword)
                    .or().like(Show::getDescription, keyword));
        }
        if (status != null && !status.isEmpty()) {
            qw.eq(Show::getStatus, status);
        } else {
            qw.ne(Show::getStatus, "DRAFT").ne(Show::getStatus, "OFF_SHELF");
        }
        qw.orderByDesc(Show::getCreateTime);

        Page<Show> showPage = showMapper.selectPage(new Page<>(page, size), qw);

        Page<ShowListVO> result = new Page<>(showPage.getCurrent(), showPage.getSize(), showPage.getTotal());
        result.setRecords(showPage.getRecords().stream().map(this::toShowListVO).collect(Collectors.toList()));
        return result;
    }

    @Override
    public ShowDetailVO getShowDetail(Long id) {
        Show show = showMapper.selectById(id);
        if (show == null) throw new BusinessException("演出不存在");
        if ("OFF_SHELF".equals(show.getStatus()) || "DRAFT".equals(show.getStatus())) {
            throw new BusinessException("演出已下架或不可访问");
        }

        ShowDetailVO vo = new ShowDetailVO();
        vo.setId(show.getId());
        vo.setTitle(show.getTitle());
        vo.setArtist(show.getArtist());
        vo.setDescription(show.getDescription());
        vo.setImage(show.getPosterUrl());
        vo.setStatus(ShowStatus.toFrontendStatus(show.getStatus()));

        Category cat = categoryMapper.selectById(show.getCategoryId());
        if (cat != null) {
            vo.setCategory(cat.getName());
            vo.setCategoryId(cat.getId());
        }

        Venue venue = venueMapper.selectById(show.getVenueId());
        if (venue != null) {
            vo.setVenue(venue.getName());
            vo.setVenueName(venue.getName());
            vo.setCity(venue.getCity());
        }

        if (show.getVenueHallId() != null) {
            VenueHall hall = venueHallMapper.selectById(show.getVenueHallId());
            if (hall != null) vo.setHallName(hall.getName());
        }

        if (show.getMinPrice() != null && show.getMaxPrice() != null) {
            if (show.getMinPrice().compareTo(show.getMaxPrice()) == 0) {
                vo.setPrice("\u00a5" + show.getMinPrice().intValue());
            } else {
                vo.setPrice("\u00a5" + show.getMinPrice().intValue() + "-" + show.getMaxPrice().intValue());
            }
        }

        // Schedules
        List<ScheduleVO> schedules = getSchedulesByShowId(id);
        vo.setSchedules(schedules);
        if (!schedules.isEmpty()) {
            vo.setDate(schedules.get(0).getShowDate().toString());
        }

        // Images
        List<ShowImage> images = imageMapper.selectList(
                new LambdaQueryWrapper<ShowImage>()
                        .eq(ShowImage::getShowId, id)
                        .orderByAsc(ShowImage::getSortOrder));
        vo.setImages(images.stream().map(ShowImage::getImageUrl).collect(Collectors.toList()));

        // Tags
        List<ShowTag> tags = tagMapper.selectList(
                new LambdaQueryWrapper<ShowTag>().eq(ShowTag::getShowId, id));
        vo.setTags(tags.stream().map(ShowTag::getTagName).collect(Collectors.toList()));

        // Related shows (same category, exclude self)
        List<Show> related = showMapper.selectList(
                new LambdaQueryWrapper<Show>()
                        .eq(Show::getCategoryId, show.getCategoryId())
                        .ne(Show::getId, id)
                        .ne(Show::getStatus, "DRAFT")
                        .ne(Show::getStatus, "OFF_SHELF")
                        .last("LIMIT 4"));
        vo.setRelatedShows(related.stream().map(this::toShowListVO).collect(Collectors.toList()));

        return vo;
    }

    @Override
    public List<ScheduleVO> getSchedulesByShowId(Long showId) {
        List<ShowSchedule> schedules = scheduleMapper.selectList(
                new LambdaQueryWrapper<ShowSchedule>()
                        .eq(ShowSchedule::getShowId, showId)
                        .orderByAsc(ShowSchedule::getShowDate, ShowSchedule::getShowTime));

        return schedules.stream().map(s -> {
            ScheduleVO vo = new ScheduleVO();
            vo.setId(s.getId());
            vo.setShowId(s.getShowId());
            vo.setShowDate(s.getShowDate());
            vo.setShowTime(s.getShowTime());
            vo.setEndTime(s.getEndTime());
            vo.setStatus(s.getStatus());
            vo.setTotalTickets(s.getTotalTickets());
            vo.setSoldTickets(s.getSoldTickets());
            vo.setAvailableTickets(s.getTotalTickets() - s.getSoldTickets());

            // Prices
            List<ScheduleSeatPrice> prices = priceMapper.selectList(
                    new LambdaQueryWrapper<ScheduleSeatPrice>()
                            .eq(ScheduleSeatPrice::getScheduleId, s.getId()));
            vo.setPrices(prices.stream().map(p -> {
                ScheduleVO.SeatPriceVO pv = new ScheduleVO.SeatPriceVO();
                pv.setId(p.getId());
                pv.setSeatType(p.getSeatType());
                pv.setPrice(p.getPrice());
                // Calculate available: count sold tickets of this type for this schedule
                long sold = 0;
                try {
                    sold = orderItemMapper.selectCount(
                            new LambdaQueryWrapper<OrderItem>()
                                    .eq(OrderItem::getScheduleId, s.getId())
                                    .eq(OrderItem::getSeatType, p.getSeatType())
                                    .in(OrderItem::getTicketStatus, "VALID", "VERIFIED"));
                } catch (Exception ignored) {}
                pv.setAvailable(null); // Let frontend treat null as available
                return pv;
            }).collect(Collectors.toList()));

            return vo;
        }).collect(Collectors.toList());
    }

    @Override
    public List<ShowListVO> getShowsByMonth(int year, int month) {
        LocalDate start = LocalDate.of(year, month, 1);
        LocalDate end = start.plusMonths(1);

        List<ShowSchedule> schedules = scheduleMapper.selectList(
                new LambdaQueryWrapper<ShowSchedule>()
                        .ge(ShowSchedule::getShowDate, start)
                        .lt(ShowSchedule::getShowDate, end));

        List<Long> showIds = schedules.stream()
                .map(ShowSchedule::getShowId).distinct().collect(Collectors.toList());
        if (showIds.isEmpty()) return new ArrayList<>();

        List<Show> shows = showMapper.selectBatchIds(showIds);
        return shows.stream().map(this::toShowListVO).collect(Collectors.toList());
    }

    @Override
    public List<ShowListVO> getFeaturedShows() {
        // Delegated to HomeConfigService, but kept for interface compatibility
        List<Show> shows = showMapper.selectList(
                new LambdaQueryWrapper<Show>()
                        .eq(Show::getStatus, "ON_SALE")
                        .orderByDesc(Show::getCreateTime)
                        .last("LIMIT 6"));
        return shows.stream().map(this::toShowListVO).collect(Collectors.toList());
    }

    @Override
    public List<ShowListVO> getUpcomingShows() {
        List<Show> shows = showMapper.selectList(
                new LambdaQueryWrapper<Show>()
                        .eq(Show::getStatus, "COMING_SOON")
                        .orderByDesc(Show::getCreateTime)
                        .last("LIMIT 6"));
        return shows.stream().map(this::toShowListVO).collect(Collectors.toList());
    }

    private ShowListVO toShowListVO(Show show) {
        ShowListVO vo = new ShowListVO();
        vo.setId(show.getId());
        vo.setTitle(show.getTitle());
        vo.setArtist(show.getArtist());
        vo.setDescription(show.getDescription());
        vo.setImage(show.getPosterUrl());
        vo.setStatus(ShowStatus.toFrontendStatus(show.getStatus()));

        Category cat = categoryMapper.selectById(show.getCategoryId());
        if (cat != null) vo.setCategory(cat.getName());

        Venue venue = venueMapper.selectById(show.getVenueId());
        if (venue != null) {
            vo.setVenue(venue.getName());
            vo.setCity(venue.getCity());
        }

        if (show.getMinPrice() != null && show.getMaxPrice() != null) {
            if (show.getMinPrice().compareTo(show.getMaxPrice()) == 0) {
                vo.setPrice("\u00a5" + show.getMinPrice().intValue());
            } else {
                vo.setPrice("\u00a5" + show.getMinPrice().intValue() + "-" + show.getMaxPrice().intValue());
            }
        }

        // First schedule date
        ShowSchedule firstSchedule = scheduleMapper.selectOne(
                new LambdaQueryWrapper<ShowSchedule>()
                        .eq(ShowSchedule::getShowId, show.getId())
                        .orderByAsc(ShowSchedule::getShowDate)
                        .last("LIMIT 1"));
        if (firstSchedule != null) {
            vo.setDate(firstSchedule.getShowDate().toString());
        }

        // Tags
        List<ShowTag> tags = tagMapper.selectList(
                new LambdaQueryWrapper<ShowTag>().eq(ShowTag::getShowId, show.getId()));
        vo.setTags(tags.stream().map(ShowTag::getTagName).collect(Collectors.toList()));

        return vo;
    }
}
