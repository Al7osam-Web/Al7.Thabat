using Al7.Thabat;
using Al7.Thabat.SitePages;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Volo.Abp.EntityFrameworkCore.Modeling;

namespace Al7.Thabat.EntityFrameworkCore.SitePages;

public class SitePageConfiguration : IEntityTypeConfiguration<SitePage>
{
    public void Configure(EntityTypeBuilder<SitePage> builder)
    {
        builder.ToTable(ThabatConsts.DbTablePrefix + "SitePages", ThabatConsts.DbSchema);
        builder.ConfigureByConvention();

        builder.Property(x => x.Key).HasMaxLength(128);
        builder.Property(x => x.Section).HasMaxLength(128);
        builder.Property(x => x.Value).HasColumnType("nvarchar(max)");
        builder.Property(x => x.PageEnum).IsRequired();

        builder.HasIndex(x => new { x.PageEnum, x.Section, x.Key });
    }
}
