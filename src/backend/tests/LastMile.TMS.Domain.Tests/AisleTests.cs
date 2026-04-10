using FluentAssertions;
using LastMile.TMS.Domain.Entities;

namespace LastMile.TMS.Domain.Tests;

public class AisleTests
{
    [Theory]
    [InlineData("1", "B", 3, "D1-B-A3")]
    [InlineData("M", "A", 1, "DM-A-A1")]
    [InlineData("2", "C", 10, "D2-C-A10")]
    public void GenerateLabel_ValidInputs_ReturnsCorrectLabel(
        string depotFirstChar, string zoneFirstChar, int order, string expected)
    {
        // Act
        var label = Aisle.GenerateLabel(depotFirstChar, zoneFirstChar, order);

        // Assert
        label.Should().Be(expected);
    }

    [Fact]
    public void SetLabel_SetsLabelFromDepotAndZone()
    {
        // Arrange
        var aisle = new Aisle { Name = "A1", Order = 1 };

        // Act
        aisle.SetLabel("1", "B");

        // Assert
        aisle.Label.Should().Be("D1-B-A1");
    }

    [Fact]
    public void Aisle_DefaultValues_AreCorrect()
    {
        // Act
        var aisle = new Aisle();

        // Assert
        aisle.Label.Should().BeEmpty();
        aisle.IsActive.Should().BeTrue();
        aisle.Name.Should().BeEmpty();
        aisle.Order.Should().Be(0);
    }

    [Fact]
    public void SetLabel_UpdatesLabelWhenCalledMultipleTimes()
    {
        // Arrange
        var aisle = new Aisle { Name = "B2", Order = 2 };

        // Act
        aisle.SetLabel("1", "X");
        var firstLabel = aisle.Label;
        aisle.SetLabel("2", "Y");
        var secondLabel = aisle.Label;

        // Assert
        firstLabel.Should().Be("D1-X-A2");
        secondLabel.Should().Be("D2-Y-A2");
    }
}
