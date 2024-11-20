package com.example.HiMade.user.mapper;

import com.example.HiMade.user.dto.UserDTO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.Map;

@Mapper
public interface UserAccountMapper {
    void insertUser(UserDTO userDTO);
    int checkId(String userId);
    UserDTO getUserById(@Param("userId") String userId);
    void updateUser(UserDTO userDTO);
    String findUserIdByNameAndPhone(@Param("userName") String userName, @Param("phonenum") String phonenum);
    int verifyUserForPasswordReset(@Param("userId") String userId,
                                   @Param("userName") String userName,
                                   @Param("phonenum") String phonenum);

    void updatePassword(@Param("userId") String userId,
                        @Param("newPassword") String newPassword);
    void deleteUser(Map<String, String> params);
}
