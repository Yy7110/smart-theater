package com.smarttheater.vo.show;

import lombok.Data;
import java.util.List;

@Data
public class ShowListVO {
    private Long id;
    private String title;
    private String category;
    private String venue;
    private String city;
    private String price;
    private String image;
    private String date;
    private String artist;
    private String description;
    private String status;
    private List<String> tags;
}
