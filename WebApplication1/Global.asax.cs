using Newtonsoft.Json;
using Newtonsoft.Json.Serialization;
using System.Web;
using System.Web.Http;
using System.Web.Mvc;
using System.Web.Optimization;
using System.Web.Routing;
using WebApplication1.Models;

namespace WebApplication1
{
    public class WebApiApplication : System.Web.HttpApplication
    {
        protected void Application_PostAuthorizeRequest()
        {
            System.Web.HttpContext.Current.SetSessionStateBehavior(System.Web.SessionState.SessionStateBehavior.Required);
        }

        protected void Application_Start()
        {
            AreaRegistration.RegisterAllAreas();
            GlobalConfiguration.Configure(WebApiConfig.Register);
            FilterConfig.RegisterGlobalFilters(GlobalFilters.Filters);
            RouteConfig.RegisterRoutes(RouteTable.Routes);
            BundleConfig.RegisterBundles(BundleTable.Bundles);

            LoadResources();
        }

        private void LoadResources()
        {
            HttpContext.Current.Application["UserManager"] = UserManager.Instance as UserManager;
            HttpContext.Current.Application["ProductManager"] = ProductManager.Instance as ProductManager;
            HttpContext.Current.Application["ReviewManager"] = ReviewManager.Instance as ReviewManager;
            HttpContext.Current.Application["OrderManager"] = OrderManager.Instance as OrderManager;
        }

        public static JsonSerializerSettings GetJsonConfig()
        {
            return new JsonSerializerSettings
            {
                Formatting = Formatting.Indented,
                ReferenceLoopHandling = ReferenceLoopHandling.Serialize,
                PreserveReferencesHandling = PreserveReferencesHandling.Objects,
                ContractResolver = new DefaultContractResolver
                {
                    NamingStrategy = new CamelCaseNamingStrategy()
                }
            };
        }

        public static void Save()
        {
            UserManager.Instance.Save();
            ProductManager.Instance.Save();
            OrderManager.Instance.Save();
            ReviewManager.Instance.Save();
        }
    }

}
