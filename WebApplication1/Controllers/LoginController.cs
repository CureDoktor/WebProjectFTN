using System;
using System.Web;
using System.Web.Http;
using WebApplication1.Models;

namespace WebApplication1.Controllers
{
    public class LoginController : ApiController
    {
        public IHttpActionResult Get()
        {
            User user = HttpContext.Current.Session["User"] as User;

            if (user is null)
                return Ok();

            SessionDataDto sessionData = new SessionDataDto
            {
                Username = user.Username,
                Role = user.Role
            };
            return Ok(sessionData);
        }

        [HttpPost, Route("api/login/signin")]
        public IHttpActionResult SignIn([FromBody] LoginDataDto loginData)
        {
            User user = UserManager.Users.Find(x => x.Username == loginData.Username 
                                                 && x.Password == loginData.Password);
            if (user is null)
                return BadRequest("Neispravno korisnicko ime ili lozinka");

            if (user.Deleted)
                return BadRequest("Vas nalog je suspendovan");

            SessionDataDto sessionData = new SessionDataDto
            {
                Username = user.Username,
                Role = user.Role
            };

            HttpContext.Current.Session["User"] = user as User;
            return Ok(sessionData);
        }

        [HttpGet, Route("api/login/signout")]
        public IHttpActionResult SignOut()
        {
            try
            {
                HttpContext.Current.Session.Abandon();
                HttpContext.Current.Session["User"] = null;
                return Ok();
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
    }
}
