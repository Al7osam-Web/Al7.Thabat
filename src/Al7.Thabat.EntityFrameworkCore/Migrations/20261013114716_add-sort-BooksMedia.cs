using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Al7.Thabat.Migrations
{
    /// <inheritdoc />
    public partial class addsortBooksMedia : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "Sort",
                table: "BooksMedia",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateIndex(
                name: "IX_BooksMedia_BookId_Sort",
                table: "BooksMedia",
                columns: new[] { "BookId", "Sort" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_BooksMedia_BookId_Sort",
                table: "BooksMedia");

            migrationBuilder.DropColumn(
                name: "Sort",
                table: "BooksMedia");
        }
    }
}
