using Microsoft.EntityFrameworkCore.Migrations;
using NetTopologySuite.Geometries;

#nullable disable

namespace LastMile.TMS.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class MakeZoneBoundaryGeometryNullable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<Geometry>(
                name: "BoundaryGeometry",
                table: "Zones",
                type: "geometry (polygon)",
                nullable: true,
                oldClrType: typeof(Geometry),
                oldType: "geometry (polygon)");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<Geometry>(
                name: "BoundaryGeometry",
                table: "Zones",
                type: "geometry (polygon)",
                nullable: false,
                oldClrType: typeof(Geometry),
                oldType: "geometry (polygon)",
                oldNullable: true);
        }
    }
}
