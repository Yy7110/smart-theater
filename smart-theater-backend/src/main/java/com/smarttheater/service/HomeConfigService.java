package com.smarttheater.service;

import com.smarttheater.vo.show.ShowListVO;
import com.smarttheater.vo.stats.HomeStatsVO;
import java.util.List;

public interface HomeConfigService {
    List<ShowListVO> getFeaturedShows();
    List<ShowListVO> getUpcomingShows();
    HomeStatsVO getHomeStats();
}
