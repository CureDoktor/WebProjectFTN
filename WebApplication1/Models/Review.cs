using Newtonsoft.Json;
using System.Collections.Generic;
using System.IO;
using System.Web.Hosting;

namespace WebApplication1.Models
{
    public class Review
    {
        public int Id { get; set; }
        public Product Product { get; set; }
        public User Reviewer { get; set; }
        public string Title { get; set; }
        public string Content { get; set; }
        public string Image { get; set; }
        public bool Approved { get; set; }
        public bool Deleted { get; set; }

        public ReviewDto ToDto() {
            return new ReviewDto
            {
                Approved = Approved,
                Content = Content,
                Deleted = Deleted,
                Id = Id,
                Image = Image,
                Title = Title,
                Product = Product.ToDto(),
                Reviewer = Reviewer.ToDto()
            };
        }
    }

    public class ReviewManager
    {
        private readonly JsonSerializerSettings serializerSettings;
        private static ReviewManager instance;
        private static readonly string path = "~/App_Data/Reviews.json";
        public static string Path => HostingEnvironment.MapPath(path);
        public static List<Review> Reviews { get; private set; } = LoadReviews();

        private ReviewManager(JsonSerializerSettings settings)
        {
            serializerSettings = settings;
        }

        public static ReviewManager Instance
        {
            get
            {
                if (instance is null)
                    instance = new ReviewManager(WebApiApplication.GetJsonConfig());
                return instance;
            }
        }

        private static List<Review> LoadReviews()
        {
            using (StreamReader sr = new StreamReader(Path))
            {
                return JsonConvert.DeserializeObject<List<Review>>(sr.ReadToEnd());
            }
        }

        internal void Save()
        {
            string data = JsonConvert.SerializeObject(Reviews, serializerSettings);

            using (StreamWriter sw = new StreamWriter(Path))
            {
                sw.WriteLine(data);
            }
        }

        public bool AddNewReview(User user, int orderId, Review review, out string errorMessage)
        {
            errorMessage = null;

            review.Id = Reviews.Count + 1;
            review.Reviewer = user;
            review.Product = OrderManager.Orders.Find(x => x.Id == orderId).Product;
            review.Deleted = false;

            if(review.Product is null)
            {
                errorMessage = "Proizvoda nema u bazi";
                return false;
            }

            review.Product.Reviews.Add(review);
            return true;
        }

        public bool RemoveReview(int reviewId, out string errorMessage)
        {
            errorMessage = null;

            var review = Reviews.Find(x => x.Id == reviewId);
            if(review is null)
            {
                errorMessage = "Ne postoji recenzija u bazi";
                return false;
            }
            ProductManager.Products.Find(x => x.Id == review.Product.Id).Deleted = true;
            review.Deleted = true;
            return true;
        }
    }
}