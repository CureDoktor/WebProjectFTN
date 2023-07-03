using System.Web;
using System.Web.Http;
using WebApplication1.Models;

namespace WebApplication1.Controllers
{
    public class RegistrationController : ApiController
    {
        [HttpPost]
        [Route("api/registration")]
        public IHttpActionResult Post([FromBody]User user)
        {
            if (!UserManager.Instance.AddNewUser(user, Role.Customer, out string errorMessage))
                return BadRequest(errorMessage);
            WebApiApplication.Save();
            return Ok();
        }

        [HttpGet]
        [Route("api/registration/CompleteUser")]
        public IHttpActionResult CompleteUser()
        {
            User user = HttpContext.Current.Session["user"] as User;
            if (user is null)
                return BadRequest("Ne postoji trenutno ulogovan korisnik.");
            return Ok(user.ToDto());
        }

        [HttpPut]
        [Route("api/registration/update")]
        public IHttpActionResult Put([FromBody]User user)
        {
            if(!UserManager.Instance.UpdateExistingUser(user, out string errorMessage))
                return BadRequest(errorMessage);
            WebApiApplication.Save();

            return Ok();
        }

    }
} 