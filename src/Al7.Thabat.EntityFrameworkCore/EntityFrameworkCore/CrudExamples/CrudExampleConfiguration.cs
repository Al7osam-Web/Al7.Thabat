using Al7.Thabat.CrudExamples;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Volo.Abp.EntityFrameworkCore.Modeling;

namespace Al7.Thabat.EntityFrameworkCore.CrudExamples;

public class CrudExampleConfiguration : IEntityTypeConfiguration<CrudExample>
{
    public void Configure(EntityTypeBuilder<CrudExample> builder)
    {
        builder.ToTable(ThabatConsts.DbTablePrefix + "CrudExamples", ThabatConsts.DbSchema);
        builder.ConfigureByConvention();

        builder.Property(x => x.Name)
            .IsRequired()
            .HasMaxLength(CrudExampleConsts.MaxNameLength);

        builder.Property(x => x.Description)
            .HasMaxLength(CrudExampleConsts.MaxDescriptionLength);

        builder.HasIndex(x => x.Name);
    }
}
