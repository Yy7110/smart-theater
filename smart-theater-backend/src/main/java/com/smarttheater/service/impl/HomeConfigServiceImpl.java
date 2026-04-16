package com.smarttheater.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.smarttheater.common.enums.ShowStatus;
import com.smarttheater.entity.*;
import com.smarttheater.mapper.*;
import com.smarttheater.service.HomeConfigService;
import com.smarttheater.vo.show.ShowListVO;
import com.smarttheater.vo.stats.HomeStatsVO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class HomeConfigServiceImpl implements HomeConfigService {

    private final HomeConfigMapper homeConfigMapper;
    private final ShowMapper showMapper;
    private final CategoryMapper categoryMapper;
    private final VenueMapper venueMapper;
    private final ShowScheduleMapper scheduleMapper;
    private final ShowTagMapper tagMapper;
    private final SysUserMapper userMapper;
    private final OrderMapper orderMapper;

    @Override
    public List<ShowListVO> getFeaturedShows() {
        List<HomeConfig> configs = homeConfigMapper.selectList(
                new LambdaQueryWrapper<HomeConfig>()
                        .eq(HomeConfig::getConfigType, "FEATURED")
                        .eq(HomeConfig::getStatus, 1)
                        .orderByAsc(HomeConfig::getSortOrder));

        if (configs.isEmpty()) {
            // Fallback: return ON_SALE shows
            List<Show> shows = showMapper.selectList(
                    new LambdaQueryWrapper<Show>()
                            .eq(Show::getStatus, "ON_SALE")
                            .orderByDesc(Show::getCreateTime)
                            .last("LIMIT 6"));
            return shows.stream().map(this::toShowListVO).collect(Collectors.toList());
        }

        List<Long> showIds = configs.stream().map(HomeConfig::getShowId).collect(Collectors.toList());
        List<Show> shows = showMapper.selectBatchIds(showIds);
        return shows.stream().map(this::toShowListVO).collect(Collectors.toList());
    }

    @Override
    public List<ShowListVO> getUpcomingShows() {
        List<HomeConfig> configs = homeConfigMapper.selectList(
                new LambdaQueryWrapper<HomeConfig>()
                        .eq(HomeConfig::getConfigType, "UPCOMING")
                        .eq(HomeConfig::getStatus, 1)
                        .orderByAsc(HomeConfig::getSortOrder));

        if (configs.isEmpty()) {
            List<Show> shows = showMapper.selectList(
                    new LambdaQueryWrapper<Show>()
                            .eq(Show::getStatus, "COMING_SOON")
                            .orderByDesc(Show::getCreateTime)
                            .last("LIMIT 6"));
            return shows.stream().map(this::toShowListVO).collect(Collectors.toList());
        }

        List<Long> showIds = configs.stream().map(HomeConfig::getShowId).collect(Collectors.toList());
        List<Show> shows = showMapper.selectBatchIds(showIds);
        return shows.stream().map(this::toShowListVO).collect(Collectors.toList());
    }

    @Override
    public HomeStatsVO getHomeStats() {
        long totalShows = showMapper.selectCount(
                new LambdaQueryWrapper<Show>().ne(Show::getStatus, "DRAFT").ne(Show::getStatus, "OFF_SHELF"));
        long totalAudience = userMapper.selectCount(
                new LambdaQueryWrapper<SysUser>().eq(SysUser::getRole, "AUDIENCE"));
        // Count distinct artists
        List<Show> allShows = showMapper.selectList(
                new LambdaQueryWrapper<Show>().select(Show::getArtist).isNotNull(Show::getArtist));
        long totalArtists = allShows.stream()
                .map(Show::getArtist).filter(a -> a != null && !a.isEmpty()).distinct().count();

        return HomeStatsVO.builder()
                .totalShows(totalShows)
                .totalAudience(totalAudience)
                .totalArtists(totalArtists)
                .satisfactionRate(98.5)
                .build();
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

        ShowSchedule firstSchedule = scheduleMapper.selectOne(
                new LambdaQueryWrapper<ShowSchedule>()
                        .eq(ShowSchedule::getShowId, show.getId())
                        .orderByAsc(ShowSchedule::getShowDate)
                        .last("LIMIT 1"));
        if (firstSchedule != null) {
            vo.setDate(firstSchedule.getShowDate().toString());
        }

        List<ShowTag> tags = tagMapper.selectList(
                new LambdaQueryWrapper<ShowTag>().eq(ShowTag::getShowId, show.getId()));
        vo.setTags(tags.stream().map(ShowTag::getTagName).collect(Collectors.toList()));

        return vo;
    }
}
