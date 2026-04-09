using FluentAssertions;
using LastMile.TMS.Domain.Entities;

namespace LastMile.TMS.Domain.Tests;

public class BinTests
{
    [Theory]
    [InlineData("D1-B-A3", 2, "D1-B-A3-02")]
    [InlineData("D1-A-A1", 1, "D1-A-A1-01")]
    [InlineData("D2-C-A10", 15, "D2-C-A10-15")]
    [InlineData("DDepot1-Z-A5", 9, "DDepot1-Z-A5-09")]
    public void GenerateLabel_ValidInputs_ReturnsCorrectLabel(
        string aisleLabel, int slot, string expected)
    {
        // Act
        var label = Bin.GenerateLabel(aisleLabel, slot);

        // Assert
        label.Should().Be(expected);
    }

    [Fact]
    public void SetLabel_SetsLabelFromAisleLabel()
    {
        // Arrange
        var depot = new Depot { Name = "1" };
        var zone = new Zone { Name = "B", Depot = depot };
        var aisle = new Aisle { Name = "A3", Zone = zone };
        var bin = new Bin { Aisle = aisle, Slot = 2, Zone = zone };

        // Act
        bin.SetLabel("D1-B-A3");

        // Assert
        bin.Label.Should().Be("D1-B-A3-02");
    }

    [Fact]
    public void GenerateLabel_ZeroSlot_PadsWithZero()
    {
        // Act
        var label = Bin.GenerateLabel("D1-A-A1", 0);

        // Assert
        label.Should().Be("D1-A-A1-00");
    }

    [Fact]
    public void Bin_DefaultValues_AreCorrect()
    {
        // Act
        var bin = new Bin();

        // Assert
        bin.Label.Should().BeEmpty();
        bin.IsActive.Should().BeTrue();
        bin.Description.Should().BeNull();
        bin.Slot.Should().Be(0);
        bin.Capacity.Should().Be(0);
        bin.AisleId.Should().Be(Guid.Empty);
    }
}
