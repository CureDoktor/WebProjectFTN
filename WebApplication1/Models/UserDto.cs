using System;
using System.Collections.Generic;

namespace WebApplication1.Models
{
    public class UserDto
    {
        public int Id { get; set; }
        public string Username { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public Gender Gender { get; set; }
        public string Email { get; set; }
        public DateTime DateOfBirth { get; set; }
        public Role Role { get; set; }
        public bool Deleted { get; set; }
        //public List<OrderDto> Orders { get; set; }
        //public List<ProductDto> FavoriteProducts { get; set; }
        //public List<ProductDto> PublishedProducts { get; set; }
    }
}