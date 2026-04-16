package com.smarttheater.vo.show;

import lombok.Data;
import java.util.List;

@Data
public class ShowDetailVO {
    private Long id;
    private String title;
    private String category;
    private Long categoryId;
    private String venue;
    private String venueName;
    private String hallName;
    private String city;
    private String price;
    private String image;
    private String date;
    private String artist;
    private String description;
    private String status;
    private List<String> tags;
    private List<String> images;
    private List<ScheduleVO> schedules;
    private List<ShowListVO> relatedShows;
}
