package com.smarttheater.common.enums;

import lombok.Getter;

@Getter
public enum ShowStatus {
    DRAFT("草稿"),
    ON_SALE("热销中"),
    COMING_SOON("即将开售"),
    SOLD_OUT("已售罄"),
    EXHIBITING("展出中"),
    OFF_SHELF("已下架");

    private final String label;
    ShowStatus(String label) { this.label = label; }

    public static String toFrontendStatus(String status) {
        try {
            return ShowStatus.valueOf(status).getLabel();
        } catch (Exception e) {
            return status;
        }
    }
}
