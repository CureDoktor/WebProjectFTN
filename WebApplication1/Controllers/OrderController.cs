using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Http;
using WebApplication1.Models;

namespace WebApplication1.Controllers
{
    public class OrderController : ApiController
    {
        [HttpGet, Route("api/order/ForCurrentUser")]
        public IHttpActionResult CompleteUser()
        {
            User user = HttpContext.Current.Session["user"] as User;
            if (user is null)
                return BadRequest("Ne postoji trenutno ulogovan korisnik.");

            List<OrderDto> orders = new List<OrderDto>();
            OrderManager.Instance.GetOrdersForUser(user).Where(x=> !x.Deleted).ToList().ForEach(x => orders.Add(x.ToDto(user.Id)));

            return Ok(orders);
        }
        [HttpGet, Route("api/order/ForAdmin")]
        public IHttpActionResult ForAdmin()
        {
            User user = HttpContext.Current.Session["user"] as User;
            if (user is null)
                return BadRequest("Ne postoji trenutno ulogovan korisnik.");
            if (user.Role != Role.Administrator)
                return BadRequest("Neodgovarajuca prava pristupa");

            List<OrderDto> orders = new List<OrderDto>();
            OrderManager.Orders.Where(x=> !x.Deleted).ToList().ForEach(x => orders.Add(x.ToDto(user.Id)));

            return Ok(orders);
        }

        [HttpPut, Route("api/order/CreateOrder")]
        public IHttpActionResult CreateOrderForCurrentUser([FromBody]Order order)
        {
            User user = HttpContext.Current.Session["user"] as User;
            if (user is null)
                return BadRequest("Ne postoji trenutno ulogovan korisnik.");

            List<OrderDto> orders = new List<OrderDto>();
            OrderManager.Instance.GetOrdersForUser(user).ForEach(x => orders.Add(x.ToDto()));
            if (!OrderManager.Instance.CreateOrder(user, order.Id, order.Quantity, out string errorMessage))
                return BadRequest(errorMessage);
            WebApiApplication.Save();
            return Ok();
        }

        [HttpGet, Route("api/order/CompleteOrder/{orderId}")]
        public IHttpActionResult CompleteOrder(int orderId)
        {
            if (!OrderManager.Instance.CompleteOrder(orderId, out string errorMessage))
                return BadRequest(errorMessage);

            WebApiApplication.Save();

            return Ok();
        }

        [HttpGet, Route("api/order/DeleteOrder/{orderId}")]
        public IHttpActionResult DeleteOrder(int orderId)
        {
            if (!OrderManager.Instance.CancelOrder(orderId, out string errorMessage))
                return BadRequest(errorMessage);

            WebApiApplication.Save();

            return Ok();
        }
    }
}
