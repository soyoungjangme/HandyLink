package com.example.HiMade.user.controller.InquiryController;

import com.example.HiMade.user.dto.InquiryDTO;
import com.example.HiMade.user.service.InquiryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/QnaList")
public class UserQnaListController {


    @Autowired
    @Qualifier("inquiryservice")
    private InquiryService inquiryService;

    @GetMapping("TestGetQna")
    public void TestGetQna(){
        List<InquiryDTO> test = inquiryService.getQnaList();
        System.out.println(inquiryService.getQnaList());

    }
}
