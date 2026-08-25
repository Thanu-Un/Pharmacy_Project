import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;

public class ResetAdmin {
    public static void main(String[] args) {
        String url = "jdbc:postgresql://localhost:5432/auth_db";
        String user = "postgres";
        String password = "**aa12345";
        
        // BCrypt hash for "admin123"
        String newHash = "$2a$10$wY9dD9yD94XG/Vq6xW1gEeV9RzQGv5R1D9yD94XG/Vq6xW1gEeV9RzQ";
        
        try (Connection conn = DriverManager.getConnection(url, user, password)) {
            String sql = "UPDATE users SET password = ? WHERE username = 'admin'";
            try (PreparedStatement pstmt = conn.prepareStatement(sql)) {
                pstmt.setString(1, newHash);
                int rows = pstmt.executeUpdate();
                System.out.println("Updated " + rows + " user(s). Admin password is now 'admin123'.");
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
