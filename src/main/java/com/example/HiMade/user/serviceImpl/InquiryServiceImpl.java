package com.example.HiMade.user.serviceImpl;

import com.example.HiMade.user.dto.InquiryDTO;
import com.example.HiMade.user.mapper.InquiryMapper;
import com.example.HiMade.user.service.InquiryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service("inquiryservice")
public class InquiryServiceImpl implements InquiryService {

    @Autowired
    private InquiryMapper inquiryMapper;

    @Override
    public List<InquiryDTO> getQnaList() {

        return inquiryMapper.getQnaList();
    }
}
