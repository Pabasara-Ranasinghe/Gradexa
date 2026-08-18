import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/test")
public class TestController {

    @GetMapping("/")
    public String home() {
        return "Gradexa Backend is running successfully!";
    }

    @GetMapping("/api/test")
    public String protectedTest() {
        return "JWT authentication is working!";
    }
}