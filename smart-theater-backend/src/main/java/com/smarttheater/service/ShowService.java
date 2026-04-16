package com.smarttheater.service;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.smarttheater.vo.show.ShowListVO;
import com.smarttheater.vo.show.ShowDetailVO;
import com.smarttheater.vo.show.ScheduleVO;
import java.util.List;

public interface ShowService {
    Page<ShowListVO> getShowList(Integer page, Integer size, String category, String keyword, String status);
    ShowDetailVO getShowDetail(Long id);
    List<ShowListVO> getFeaturedShows();
    List<ShowListVO> getUpcomingShows();
    List<ScheduleVO> getSchedulesByShowId(Long showId);
    List<ShowListVO> getShowsByMonth(int year, int month);
}
