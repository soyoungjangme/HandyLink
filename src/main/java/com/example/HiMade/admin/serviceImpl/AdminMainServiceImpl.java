package com.example.HiMade.admin.serviceImpl;

import com.example.HiMade.admin.dto.alertDTO;
import com.example.HiMade.admin.mapper.AdminMainMapper;
import com.example.HiMade.admin.service.AdminMainService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service("AdminMainService")
public class AdminMainServiceImpl implements AdminMainService {

  @Autowired
  private AdminMainMapper adminMainMapper;

  @Override
  public alertDTO test() {
    System.out.println("결과" + adminMainMapper.testAdmin());
    return adminMainMapper.testAdmin();
  }
}
