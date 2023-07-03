using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.IO;
using System.Web.Hosting;

namespace WebApplication1.Models
{
    public class Product
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public decimal Price { get; set; }
        public int Quantity { get; set; }
        public string Description { get; set; }
        public string Image { get; set; }
        public DateTime DatePosted { get; set; }
        public bool Deleted { get; set; }
        public string City { get; set; }
        public List<Review> Reviews { get; set; }

        public ProductDto ToDto() {
            return new ProductDto
            {
                Id = Id,
                Name = Name,
                Price = Price,
                City = City,
                Description = Description,
                Image = Image,
                Quantity = Quantity,
                Deleted = Deleted
            };
        }
    }

    public class ProductManager
    {
        private readonly JsonSerializerSettings serializerSettings;
        private static ProductManager instance;
        private static readonly string path = "~/App_Data/Products.json";
        public static string Path => HostingEnvironment.MapPath(path);
        public static List<Product> Products { get; private set; } = LoadProducts();

        private ProductManager(JsonSerializerSettings settings)
        {
            serializerSettings = settings;
        }

        public static ProductManager Instance
        {
            get
            {
                if (instance is null)
                    instance = new ProductManager(WebApiApplication.GetJsonConfig());
                return instance;
            }
        }

        private static List<Product> LoadProducts()
        {
            using (StreamReader sr = new StreamReader(Path))
            {
                return JsonConvert.DeserializeObject<List<Product>>(sr.ReadToEnd());
            }
        }

        internal void Save()
        {
            string data = JsonConvert.SerializeObject(Products, serializerSettings);

            using (StreamWriter sw = new StreamWriter(Path))
            {
                sw.WriteLine(data);
            }
        }
    }
}