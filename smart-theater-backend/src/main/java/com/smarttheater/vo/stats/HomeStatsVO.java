package com.smarttheater.vo.stats;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class HomeStatsVO {
    private Long totalShows;
    private Long totalAudience;
    private Long totalArtists;
    private Double satisfactionRate;
}
