namespace WebApplication1.Models
{
    public class ReviewDto
    {
        public int Id { get; set; }
        public ProductDto Product { get; set; }
        public UserDto Reviewer { get; set; }
        public string Title { get; set; }
        public string Content { get; set; }
        public string Image { get; set; }
        public bool Approved { get; set; }
        public bool Deleted { get; set; }
    }
}