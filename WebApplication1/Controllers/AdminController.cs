using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web;
using System.Web.Http;
using WebApplication1.Models;

namespace WebApplication1.Controllers
{
    public class AdminController : ApiController
    {
        [HttpGet, Route("api/admin/GetNonAdminUsers")]
        public IHttpActionResult Get()
        {
            User user = HttpContext.Current.Session["user"] as User;
            if (user is null)
                return BadRequest("Ne postoji trenutno ulogovan korisnik.");
            if (user.Role != Role.Administrator)
                return BadRequest("Nemate dovoljna ovlascenja");
            List<UserDto> users = new List<UserDto>();
            UserManager.Users.Where(x => x.Role != Role.Administrator).ToList().ForEach(x => users.Add(x.ToDto()));
            return Ok(users);
        }
    }
}
