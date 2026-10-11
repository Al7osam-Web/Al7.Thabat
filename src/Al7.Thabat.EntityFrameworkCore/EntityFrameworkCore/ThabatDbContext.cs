using Al7.Thabat.Books;
using Al7.Thabat.Clients;
using Al7.Thabat.CrudExamples;
using Al7.Thabat.EntityFrameworkCore.CrudExamples;
using Al7.Thabat.EntityFrameworkCore.SitePages;
using Al7.Thabat.SitePages;
using Al7.Thabat.Surveys;
using Al7.Thabat.Tasks;
using Microsoft.EntityFrameworkCore;
using Volo.Abp.AuditLogging.EntityFrameworkCore;
using Volo.Abp.BackgroundJobs.EntityFrameworkCore;
using Volo.Abp.BlobStoring.Database.EntityFrameworkCore;
using Volo.Abp.Data;
using Volo.Abp.DependencyInjection;
using Volo.Abp.EntityFrameworkCore;
using Volo.Abp.EntityFrameworkCore.Modeling;
using Volo.Abp.FeatureManagement.EntityFrameworkCore;
using Volo.Abp.Identity;
using Volo.Abp.Identity.EntityFrameworkCore;
using Volo.Abp.PermissionManagement.EntityFrameworkCore;
using Volo.Abp.SettingManagement.EntityFrameworkCore;
using Volo.Abp.OpenIddict.EntityFrameworkCore;

namespace Al7.Thabat.EntityFrameworkCore;

[ReplaceDbContext(typeof(IIdentityDbContext))]
[ConnectionStringName("Default")]
public class ThabatDbContext :
    AbpDbContext<ThabatDbContext>,
    IIdentityDbContext
{
    public DbSet<CrudExample> CrudExamples { get; set; }

    public DbSet<SitePage> SitePages { get; set; }

    public DbSet<SurveyQuestion> SurveyQuestions { get; set; }

    public DbSet<SurveyAnswer> SurveyAnswers { get; set; }

    public DbSet<TaskItem> Tasks { get; set; }

    public DbSet<TaskRegistration> TaskRegistrations { get; set; }

    public DbSet<Client> Clients { get; set; }

    public DbSet<Book> Books { get; set; }

    public DbSet<BookMedia> BooksMedia { get; set; }


    #region Entities from the modules

    /* Notice: We only implemented IIdentityProDbContext 
     * and replaced them for this DbContext. This allows you to perform JOIN
     * queries for the entities of these modules over the repositories easily. You
     * typically don't need that for other modules. But, if you need, you can
     * implement the DbContext interface of the needed module and use ReplaceDbContext
     * attribute just like IIdentityProDbContext .
     *
     * More info: Replacing a DbContext of a module ensures that the related module
     * uses this DbContext on runtime. Otherwise, it will use its own DbContext class.
     */

    // Identity
    public DbSet<IdentityUser> Users { get; set; }
    public DbSet<IdentityRole> Roles { get; set; }
    public DbSet<IdentityClaimType> ClaimTypes { get; set; }
    public DbSet<OrganizationUnit> OrganizationUnits { get; set; }
    public DbSet<IdentitySecurityLog> SecurityLogs { get; set; }
    public DbSet<IdentityLinkUser> LinkUsers { get; set; }
    public DbSet<IdentityUserDelegation> UserDelegations { get; set; }
    public DbSet<IdentitySession> Sessions { get; set; }

    #endregion

    public ThabatDbContext(DbContextOptions<ThabatDbContext> options)
        : base(options)
    {

    }

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        /* Include modules to your migration db context */

        builder.ConfigurePermissionManagement();
        builder.ConfigureSettingManagement();
        builder.ConfigureBackgroundJobs();
        builder.ConfigureAuditLogging();
        builder.ConfigureFeatureManagement();
        builder.ConfigureIdentity();
        builder.ConfigureOpenIddict();
        builder.ConfigureBlobStoring();
        
        builder.ApplyConfiguration(new CrudExampleConfiguration());
        builder.ApplyConfiguration(new SitePageConfiguration());

        builder.Entity<SurveyQuestion>(b =>
        {
            b.ToTable("SurveyQuestions");
            b.ConfigureByConvention();
            b.Property(x => x.TitleAr).HasMaxLength(512);
            b.Property(x => x.TitleEn).HasMaxLength(512);
            b.HasMany(x => x.Answers)
                .WithOne(x => x.SurveyQuestion)
                .HasForeignKey(x => x.SurveyQuestionId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        builder.Entity<SurveyAnswer>(b =>
        {
            b.ToTable("SurveyAnswers");
            b.ConfigureByConvention();
            b.Property(x => x.TitleAr).HasMaxLength(512);
            b.Property(x => x.TitleEn).HasMaxLength(512);
            b.HasIndex(x => x.SurveyQuestionId);
        });

        builder.Entity<TaskItem>(b =>
        {
            b.ToTable("Tasks");
            b.ConfigureByConvention();
            b.Property(x => x.Stage).IsRequired();
            b.Property(x => x.TitleAr).HasMaxLength(512);
            b.Property(x => x.TitleEn).HasMaxLength(512);
            b.Property(x => x.SubTitleAr).HasMaxLength(512);
            b.Property(x => x.SubTitleEn).HasMaxLength(512);
            b.Property(x => x.Day).IsRequired();
            b.HasIndex(x => new { x.Stage, x.Day });
        });

        builder.Entity<TaskRegistration>(b =>
        {
            b.ToTable("TaskRegistrations");
            b.ConfigureByConvention();
            b.HasIndex(x => x.TaskId);
            b.HasIndex(x => x.ClientId);
            b.HasOne(x => x.Task)
                .WithMany()
                .HasForeignKey(x => x.TaskId)
                .OnDelete(DeleteBehavior.Cascade);
            b.HasOne(x => x.Client)
                .WithMany()
                .HasForeignKey(x => x.ClientId)
                .OnDelete(DeleteBehavior.NoAction);
        });

        builder.Entity<Client>(b =>
        {
            b.ToTable("Clients");
            b.ConfigureByConvention();
            b.Property(x => x.Name).HasMaxLength(256);
            b.Property(x => x.Avatar).HasMaxLength(500);
            b.Property(x => x.EmailAddress).HasMaxLength(256);
            b.Property(x => x.PhoneNumber).HasMaxLength(50);
            b.Property(x => x.IsActive).IsRequired().HasDefaultValue(true);
            b.HasIndex(x => x.UserId).IsUnique();
            b.HasOne(x => x.User)
                .WithMany()
                .HasForeignKey(x => x.UserId)
                .OnDelete(DeleteBehavior.NoAction);
        });

        builder.Entity<Book>(b =>
        {
            b.ToTable("Books");
            b.ConfigureByConvention();
            b.Property(x => x.NameAr).HasMaxLength(256);
            b.Property(x => x.NameEn).HasMaxLength(256);
            b.Property(x => x.CoverImage).HasMaxLength(500);
            b.HasMany(x => x.Media)
                .WithOne(x => x.Book)
                .HasForeignKey(x => x.BookId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        builder.Entity<BookMedia>(b =>
        {
            b.ToTable("BooksMedia");
            b.ConfigureByConvention();
            b.Property(x => x.FilePath).HasMaxLength(500);
            b.HasIndex(x => x.BookId);
        });
    }
}
