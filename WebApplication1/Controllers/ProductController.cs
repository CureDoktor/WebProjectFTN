using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Http;
using WebApplication1.Models;

namespace WebApplication1.Controllers
{
    public class ProductController : ApiController
    {
        [HttpGet]
        public IHttpActionResult GetProducts()
        {
            List<ProductDto> products = new List<ProductDto>();
            ProductManager.Products.Where(x => x.Quantity >0).ToList().ForEach(x => products.Add(x.ToDto()));

            return Ok(products);
        }

        [HttpGet, Route("api/product/Seller")]
        public IHttpActionResult GetForSeller()
        {
            User user = HttpContext.Current.Session["user"] as User;

            if (user is null)
                return BadRequest("Ne postoji trenutno ulogovan korisnik.");

            List<ProductDto> products = new List<ProductDto>();
            user.PublishedProducts.ForEach(x => products.Add(x.ToDto()));

            return Ok(products);
        }

        [HttpGet, Route("api/product/GetProductDetails/{productId}")]
        public IHttpActionResult GetProduct(int productId)
        {
            var product = ProductManager.Products.Find(x => x.Id == productId).ToDto();

            if (product is null)
                return BadRequest("Pogresan ID");

            return Ok(product);
        }

        [HttpGet, Route("api/product/DeleteProduct/{productId}")]
        public IHttpActionResult DeleteProduct(int productId)
        {
            User user = HttpContext.Current.Session["user"] as User;

            if (user is null)
                return BadRequest("Ne postoji trenutno ulogovan korisnik.");

            var product = ProductManager.Products.Find(x => x.Id == productId);

            if (product is null)
                return BadRequest("Pogresan ID");
            product.Deleted = true;
            WebApiApplication.Save();
            return Ok();
        }
        
        [HttpGet, Route("api/product/getFavorite")]
        public IHttpActionResult GetFavouriteProducts()
        {
            User user = HttpContext.Current.Session["user"] as User;

            if (user is null)
                return BadRequest("Ne postoji trenutno ulogovan korisnik.");

            List<ProductDto> products = new List<ProductDto>();
            user.FavoriteProducts.ForEach(x => products.Add(x.ToDto()));

            return Ok(products);
        }

        [HttpPut, Route("api/product/UpdateProduct")]
        public IHttpActionResult Update([FromBody] Product product)
        {
            User user = HttpContext.Current.Session["user"] as User;

            if (user is null)
                return BadRequest("Ne postoji trenutno ulogovan korisnik.");

            var oldProduct = ProductManager.Products.Find(x => x.Id == product.Id);

            if (oldProduct is null)
                return BadRequest("Pogresan ID");

            oldProduct.Image = product.Image;
            oldProduct.Name = product.Name;
            oldProduct.Price = product.Price;
            oldProduct.Quantity = product.Quantity;
            oldProduct.City = product.City;
            oldProduct.DatePosted = product.DatePosted;
            oldProduct.Description = product.Description;
            WebApiApplication.Save();
            return Ok();
        }
        
        [HttpPut, Route("api/product/AddProduct")]
        public IHttpActionResult AddProduct([FromBody] Product product)
        {
            User user = HttpContext.Current.Session["user"] as User;

            if (user is null)
                return BadRequest("Ne postoji trenutno ulogovan korisnik.");

            product.Id = ProductManager.Products.Count + 1;
            product.Reviews = new List<Review>();
            product.Deleted = false;
            product.DatePosted = DateTime.Now;

            ProductManager.Products.Add(product);
            user.PublishedProducts.Add(product);
            WebApiApplication.Save();
            return Ok();
        }

        [HttpPost, Route("api/product/AddToFavourite")]
        public IHttpActionResult AddItemToFavourites([FromBody]Product product)
        {
            User user = HttpContext.Current.Session["user"] as User;

            if (user is null)
                return BadRequest("Ne postoji trenutno ulogovan korisnik.");

            if (!UserManager.Instance.AddFavouriteProductToUser(user, product.Id, out string errorMessage))
                return BadRequest(errorMessage);
            WebApiApplication.Save();
            return Ok();
        }

    }
}
