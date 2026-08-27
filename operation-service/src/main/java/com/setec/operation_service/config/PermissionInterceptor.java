package com.setec.operation_service.config;

import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class PermissionInterceptor implements HandlerInterceptor {

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        if (request.getMethod().equalsIgnoreCase("OPTIONS")) {
            return true;
        }

        String path = request.getRequestURI();
        String method = request.getMethod();
        
        // Secure critical operations to prevent damage
        boolean needsCheck = false;
        String requiredPermission = "";

        if (path.startsWith("/api/operation/sales") && method.equals("DELETE")) {
            needsCheck = true;
            requiredPermission = "pos_sale_delete";
        } else if (path.startsWith("/api/operation/staffs") && !method.equals("GET")) {
            needsCheck = true;
            requiredPermission = "staff_edit"; 
        } else if (path.startsWith("/api/operation/products") && method.equals("DELETE")) {
            needsCheck = true;
            requiredPermission = "medicine_delete";
        } else if (path.startsWith("/api/operation/categories") && method.equals("DELETE")) {
            needsCheck = true;
            requiredPermission = "category_delete";
        } else if (path.startsWith("/api/operation/units") && method.equals("DELETE")) {
            needsCheck = true;
            requiredPermission = "unit_delete";
        } else if (path.startsWith("/api/operation/suppliers") && method.equals("DELETE")) {
            needsCheck = true;
            requiredPermission = "supplier_delete";
        } else if (path.startsWith("/api/operation/system-settings") && !method.equals("GET")) {
            needsCheck = true;
            // Simple generic permission for modifying core settings
            requiredPermission = "setting_"; 
        }

        if (needsCheck) {
            String permsHeader = request.getHeader("X-Auth-Permissions");
            if (permsHeader == null || !permsHeader.contains(requiredPermission)) {
                response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                response.getWriter().write("Forbidden: Missing required permission (" + requiredPermission + ")");
                return false;
            }
        }
        
        return true;
    }
}
