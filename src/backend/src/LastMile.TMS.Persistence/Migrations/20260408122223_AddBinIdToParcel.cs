using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LastMile.TMS.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddBinIdToParcel : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "BinId",
                table: "Parcel",
                type: "uuid",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Parcel_BinId",
                table: "Parcel",
                column: "BinId");

            migrationBuilder.AddForeignKey(
                name: "FK_Parcel_Bins_BinId",
                table: "Parcel",
                column: "BinId",
                principalTable: "Bins",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Parcel_Bins_BinId",
                table: "Parcel");

            migrationBuilder.DropIndex(
                name: "IX_Parcel_BinId",
                table: "Parcel");

            migrationBuilder.DropColumn(
                name: "BinId",
                table: "Parcel");
        }
    }
}
