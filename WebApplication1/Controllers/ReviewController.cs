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
    public class ReviewController : ApiController
    {
        [HttpPost]
        [Route("api/review/AddReview")]
        public IHttpActionResult AddReview([FromBody] Review review)
        {
            User user = HttpContext.Current.Session["user"] as User;
            if (user is null)
                return BadRequest("Ne postoji trenutno ulogovan korisnik.");

            if (!ReviewManager.Instance.AddNewReview(user, review.Id, review, out string errorMessage))
                return BadRequest(errorMessage);
            WebApiApplication.Save();
            return Ok();
        }

        [HttpPost]
        [Route("api/review/DeleteReview/{reviewId}")]
        public IHttpActionResult DeleteReview(int reviewId)
        {
            User user = HttpContext.Current.Session["user"] as User;
            if (user is null)
                return BadRequest("Ne postoji trenutno ulogovan korisnik.");

            if (!ReviewManager.Instance.RemoveReview(reviewId, out string errorMessage))
                return BadRequest(errorMessage);
            WebApiApplication.Save();
            return Ok();
        }

        [HttpGet]
        [Route("api/review/Approve/{reviewId}")]
        public IHttpActionResult Approve(int reviewId)
        {
            User user = HttpContext.Current.Session["user"] as User;
            if (user is null)
                return BadRequest("Ne postoji trenutno ulogovan korisnik.");

            ReviewManager.Reviews.Find(x => x.Id == reviewId).Approved = true;
            WebApiApplication.Save();
            return Ok();
        }

        [HttpGet]
        [Route("api/review/Decline/{reviewId}")]
        public IHttpActionResult Decline(int reviewId)
        {
            User user = HttpContext.Current.Session["user"] as User;
            if (user is null)
                return BadRequest("Ne postoji trenutno ulogovan korisnik.");

            ReviewManager.Reviews.Find(x => x.Id == reviewId).Approved = false;
            WebApiApplication.Save();
            return Ok();
        }

        [HttpGet]
        [Route("api/review/ReturnAll")]
        public IHttpActionResult ReturnAll()
        {
            User user = HttpContext.Current.Session["user"] as User;
            if (user is null)
                return BadRequest("Ne postoji trenutno ulogovan korisnik.");

            List<ReviewDto> reviews = new List<ReviewDto>();
            ReviewManager.Reviews.Where(x => !x.Deleted).ToList().ForEach(x => reviews.Add(x.ToDto()));
            
            return Ok(reviews);
        }
    }


}
