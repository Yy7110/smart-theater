package com.smarttheater.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.smarttheater.entity.SysUser;
import org.apache.ibatis.annotations.Delete;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface SysUserMapper extends BaseMapper<SysUser> {
    @Delete("DELETE FROM sys_user WHERE id = #{id}")
    int deleteUserById(Long id);
}
