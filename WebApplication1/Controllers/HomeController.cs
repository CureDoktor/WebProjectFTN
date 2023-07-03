using System.Web.Http;
using System.Web.Http.Results;

namespace WebApplication1.Controllers
{
    public class HomeController : ApiController
    {
        [HttpGet, Route("")]
        public RedirectResult Index()
        {
            var requestUri = Request.RequestUri;
            return Redirect(requestUri.AbsoluteUri + "Html/Index.html");
        }
    }
}
