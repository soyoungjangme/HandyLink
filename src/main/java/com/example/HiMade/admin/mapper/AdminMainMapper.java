package com.example.HiMade.admin.mapper;
import com.example.HiMade.admin.dto.alertDTO;
import org.apache.ibatis.annotations.Mapper;


@Mapper
public interface AdminMainMapper {
   alertDTO testAdmin();
}
