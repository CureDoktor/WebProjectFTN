using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Web.Hosting;

namespace WebApplication1.Models
{
    public class User
    {
        public int Id { get; set; }
        public string Username { get; set; }
        public string Password { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public Gender Gender { get; set; }
        public string Email { get; set; }
        public DateTime DateOfBirth { get; set; }
        public Role Role { get; set; }
        public bool Deleted { get; set; }
        public List<Order> Orders { get; set; }
        public List<Product> FavoriteProducts { get; set; }
        public List<Product> PublishedProducts { get; set; }

        public UserDto ToDto() {
            return new UserDto
            {
                Id = Id,
                DateOfBirth = DateOfBirth,
                Deleted = Deleted,
                Email = Email,
                Gender = Gender,
                FirstName = FirstName,
                Username = Username,
                Role = Role,
                LastName = LastName
            };
        }
    }

    public class UserManager
    {
        private readonly JsonSerializerSettings serializerSettings;
        private static UserManager instance;
        private static readonly string path = "~/App_Data/Users.json";
        public static string Path => HostingEnvironment.MapPath(path);
        public static List<User> Users { get; private set; } = LoadUsers();

        private UserManager(JsonSerializerSettings settings)
        {
            serializerSettings = settings;
        }

        public static UserManager Instance
        {
            get
            {
                if (instance is null)
                    instance = new UserManager(WebApiApplication.GetJsonConfig());
                return instance;
            }
        }

        private static List<User> LoadUsers()
        {
            using (StreamReader sr = new StreamReader(Path))
            {
                return JsonConvert.DeserializeObject<List<User>>(sr.ReadToEnd());
            }
        }

        internal void Save()
        {
            string data = JsonConvert.SerializeObject(Users, serializerSettings);

            using (StreamWriter sw = new StreamWriter(Path))
            {
                sw.WriteLine(data);
            }
        }

        public bool AddNewUser(User user, Role role, out string errorMessage)
        {
            errorMessage = null;

            if (Users.Exists(x => x.Email == user.Email))
            {
                errorMessage = "E-mail adresa je zauzeta.";
                return false;
            }

            if (Users.Exists(x => x.Username == user.Username))
            {
                errorMessage = "Korisnicko ime je zauzeto.";
                return false;
            }

            user.Id = Users.Count + 1;
            user.Role = role;
            user.Orders = new List<Order>();
            user.FavoriteProducts = new List<Product>();
            user.PublishedProducts = new List<Product>();
            user.Deleted = false;

            Users.Add(user);
            Save();
            return true;
        }

        public bool UpdateExistingUser(User newUser, out string errorMessage)
        {
            errorMessage = null;

            User oldUser = Users.Find(x => x.Id == newUser.Id);

            if (oldUser is null)
            {
                errorMessage = "Ne postoji odgovarajuci korisnik";
                return false;
            }

            if(Users.Exists(x => x.Email == newUser.Email && x.Id != newUser.Id))
            {
                errorMessage = "Email adresa je zauzeta";
                return false;
            }

            if (Users.Exists(x => x.Username == newUser.Username && x.Id != newUser.Id))
            {
                errorMessage = "Korisnicko ime je zauzeto";
                return false;
            }

            Users.Remove(oldUser);
            Users.Add(newUser);
            return true;
        }

        public bool AddFavouriteProductToUser(User user, int productId, out string errorMessage)
        {
            errorMessage = null;
            var product = ProductManager.Products.Find(x => x.Id == productId);
            if (product is null)
            {
                errorMessage = "Proizvod ne postoji u bazi";
                return false;
            }

            if (user.FavoriteProducts.Contains(product))
            {
                errorMessage = "Proizvod je vec oznacen kao omiljeni.";
                return false;
            }

            Users.Find(x => x == user).FavoriteProducts.Add(product);
            return true;
        }
    }
}