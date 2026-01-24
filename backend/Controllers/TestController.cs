using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/[controller]")]
public class TestController : ControllerBase
{
    [HttpGet("ping")]
    public IActionResult Ping()
    {
        return Ok("Pong from HR API");
    }
}