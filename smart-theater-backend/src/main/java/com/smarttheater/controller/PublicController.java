package com.smarttheater.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.smarttheater.common.result.Result;
import com.smarttheater.service.*;
import com.smarttheater.vo.seat.SeatMapVO;
import com.smarttheater.vo.show.ShowDetailVO;
import com.smarttheater.vo.show.ShowListVO;
import com.smarttheater.vo.show.ScheduleVO;
import com.smarttheater.vo.stats.HomeStatsVO;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/public")
@RequiredArgsConstructor
public class PublicController {

    private final ShowService showService;
    private final SeatService seatService;
    private final HomeConfigService homeConfigService;
    private final ContactService contactService;
    private final com.smarttheater.mapper.CategoryMapper categoryMapper;
    private final com.smarttheater.mapper.VenueMapper venueMapper;

    @GetMapping("/shows")
    public Result<Page<ShowListVO>> getShows(
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "12") Integer size,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String status) {
        return Result.success(showService.getShowList(page, size, category, keyword, status));
    }

    @GetMapping("/shows/{id}")
    public Result<ShowDetailVO> getShowDetail(@PathVariable Long id) {
        return Result.success(showService.getShowDetail(id));
    }

    @GetMapping("/shows/{id}/schedules")
    public Result<List<ScheduleVO>> getSchedules(@PathVariable Long id) {
        return Result.success(showService.getSchedulesByShowId(id));
    }

    @GetMapping("/schedule/{scheduleId}/seats")
    public Result<SeatMapVO> getSeatMap(@PathVariable Long scheduleId) {
        return Result.success(seatService.getSeatMap(scheduleId));
    }

    @GetMapping("/home/featured")
    public Result<List<ShowListVO>> getFeaturedShows() {
        return Result.success(homeConfigService.getFeaturedShows());
    }

    @GetMapping("/home/upcoming")
    public Result<List<ShowListVO>> getUpcomingShows() {
        return Result.success(homeConfigService.getUpcomingShows());
    }

    @GetMapping("/home/stats")
    public Result<HomeStatsVO> getHomeStats() {
        return Result.success(homeConfigService.getHomeStats());
    }

    @GetMapping("/schedule/calendar")
    public Result<List<ShowListVO>> getCalendar(
            @RequestParam int year, @RequestParam int month) {
        return Result.success(showService.getShowsByMonth(year, month));
    }

    @PostMapping("/contact")
    public Result<Void> submitContact(@RequestBody Map<String, String> body) {
        contactService.submitMessage(
                body.get("name"), body.get("email"),
                body.get("subject"), body.get("message"));
        return Result.success();
    }

    @GetMapping("/categories")
    public Result<List<com.smarttheater.entity.Category>> getCategories() {
        return Result.success(categoryMapper.selectList(null));
    }

    @GetMapping("/venues/{id}")
    public Result<com.smarttheater.entity.Venue> getVenue(@PathVariable Long id) {
        return Result.success(venueMapper.selectById(id));
    }
}
