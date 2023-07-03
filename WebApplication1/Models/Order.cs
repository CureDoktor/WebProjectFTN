using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.IO;
using System.Web.Hosting;

namespace WebApplication1.Models
{
    public class Order
    {
        public int Id { get; set; }
        public Product Product { get; set; }
        public int Quantity { get; set; }
        public bool Deleted { get; set; }
        public User Customer { get; set; }
        public DateTime OrderDate { get; set; }
        public OrderStatus Status { get; set; }

        public OrderDto ToDto()
        {
            return new OrderDto
            {
                Id = Id,
                Deleted = Deleted,
                Product = Product.ToDto(),
                Status = Status,
                Quantity = Quantity,
                Customer = Customer.ToDto(),
                OrderDate = OrderDate
            };
        }
        public OrderDto ToDto(int customerId)
        {
            return new OrderDto
            {
                Id = Id,
                Deleted = Deleted,
                Product = Product.ToDto(),
                Status = Status,
                Quantity = Quantity,
                Customer = Customer.ToDto(),
                OrderDate = OrderDate
            };
        }
    }

    public class OrderManager
    {
        private readonly JsonSerializerSettings serializerSettings;
        private static OrderManager instance;
        private static readonly string path = "~/App_Data/Orders.json";
        public static string Path => HostingEnvironment.MapPath(path);
        public static List<Order> Orders { get; private set; } = LoadOrders();

        private OrderManager(JsonSerializerSettings settings)
        {
            serializerSettings = settings;
        }

        public static OrderManager Instance
        {
            get
            {
                if (instance is null)
                    instance = new OrderManager(WebApiApplication.GetJsonConfig());
                return instance;
            }
        }

        private static List<Order> LoadOrders()
        {
            using (StreamReader sr = new StreamReader(Path))
            {
                return JsonConvert.DeserializeObject<List<Order>>(sr.ReadToEnd());
            }
        }

        internal void Save()
        {
            string data = JsonConvert.SerializeObject(Orders, serializerSettings);

            using (StreamWriter sw = new StreamWriter(Path))
            {
                sw.WriteLine(data);
            }
        }

        public List<Order> GetOrdersForUser(User user)
        {
            return Orders.FindAll(x => x.Customer.Id == user.Id && x.Deleted == false);
        }

        public bool CreateOrder(User user, int productId, int quantity, out string errorMessage) {
            errorMessage = null;

            var product = ProductManager.Products.Find(x => x.Id == productId);

            if (product is null)
            {
                errorMessage = "Ne postoji proizvod u bazi";
                return false;
            }

            if(product.Quantity < quantity)
            {
                errorMessage = "Nije dostupna trazena kolicina";
                return false;
            }

            var order = new Order() {
                Id = Orders.Count + 1,
                Deleted = false,
                Quantity = quantity,
                Customer = user,
                OrderDate = DateTime.Now,
                Product = product,
                Status = OrderStatus.Active
            };

            Orders.Add(order);
            UserManager.Users.Find(x => x.Id == user.Id).Orders.Add(order);
            product.Quantity -= quantity;

            return true;
        }

        public bool CompleteOrder(int orderId, out string errorMessage)
        {
            errorMessage = null;

            var order = Orders.Find(x => x.Id == orderId);

            if (order is null)
            {
                errorMessage = "Ne postoji porudzbina u bazi.";
                return false;
            }

            if(order.Status != OrderStatus.Active)
            {
                errorMessage = "Samo aktivne porudzbine mogu da se oznace kao izvrsene.";
                return false;
            }

            order.Status = OrderStatus.Executed;
            return true;
        }

        public bool CancelOrder(int orderId, out string errorMessage)
        {
            errorMessage = null;

            var order = Orders.Find(x => x.Id == orderId);

            if (order is null)
            {
                errorMessage = "Ne postoji porudzbina u bazi.";
                return false;
            }

            if (order.Status != OrderStatus.Active)
            {
                errorMessage = "Samo aktivne porudzbine mogu da se oznace kao otkazane.";
                return false;
            }

            order.Status = OrderStatus.Canceled;

            order.Product.Quantity += order.Quantity;

            return true;
        }

    }
}