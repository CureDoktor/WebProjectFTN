using System;

namespace WebApplication1.Models
{
    public class OrderDto
    {
        public int Id { get; set; }
        public ProductDto Product { get; set; }
        public int Quantity { get; set; }
        public bool Deleted { get; set; }
        public UserDto Customer { get; set; }
        public DateTime OrderDate { get; set; }
        public OrderStatus Status { get; set; }
    }
}