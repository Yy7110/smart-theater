package com.smarttheater.vo.inspector;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class VerifyResultVO {
    private String result;  // SUCCESS, ALREADY_VERIFIED, INVALID, EXPIRED
    private String message;
    private String ticketNo;
    private String showTitle;
    private String seatLabel;
    private String scheduleInfo;
    private String verifyTime;
}
