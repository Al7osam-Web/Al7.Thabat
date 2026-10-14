using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Al7.Thabat.Migrations
{
    /// <inheritdoc />
    public partial class createPathstables : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "PathDay",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Stage = table.Column<int>(type: "int", nullable: false),
                    Day = table.Column<int>(type: "int", nullable: false),
                    CreationTime = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatorId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    LastModificationTime = table.Column<DateTime>(type: "datetime2", nullable: true),
                    LastModifierId = table.Column<Guid>(type: "uniqueidentifier", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PathDay", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "PathEntry",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    PathDayId = table.Column<long>(type: "bigint", nullable: false),
                    Section = table.Column<int>(type: "int", nullable: false),
                    DescriptionAr = table.Column<string>(type: "nvarchar(4000)", maxLength: 4000, nullable: false),
                    DescriptionEn = table.Column<string>(type: "nvarchar(4000)", maxLength: 4000, nullable: true),
                    Sort = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PathEntry", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PathEntry_PathDay_PathDayId",
                        column: x => x.PathDayId,
                        principalTable: "PathDay",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_PathDay_Stage_Day",
                table: "PathDay",
                columns: new[] { "Stage", "Day" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_PathEntry_PathDayId",
                table: "PathEntry",
                column: "PathDayId");

            migrationBuilder.CreateIndex(
                name: "IX_PathEntry_PathDayId_Section_Sort",
                table: "PathEntry",
                columns: new[] { "PathDayId", "Section", "Sort" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "PathEntry");

            migrationBuilder.DropTable(
                name: "PathDay");
        }
    }
}
