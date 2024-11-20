package com.example.HiMade.user.mapper;

import com.example.HiMade.user.dto.InquiryDTO;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface InquiryMapper {

    public List<InquiryDTO> getQnaList();

}
