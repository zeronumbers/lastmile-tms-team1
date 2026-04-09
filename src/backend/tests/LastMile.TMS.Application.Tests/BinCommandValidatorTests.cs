using FluentAssertions;
using LastMile.TMS.Application.Features.Bins.Commands.CreateBin;
using LastMile.TMS.Application.Features.Bins.Commands.UpdateBin;

namespace LastMile.TMS.Application.Tests;

public class CreateBinCommandValidatorTests
{
    private readonly CreateBinCommandValidator _validator = new();

    [Fact]
    public void Validate_ValidCommand_ShouldPass()
    {
        // Arrange
        var command = new CreateBinCommand(
            Description: "Test bin",
            AisleId: Guid.NewGuid(),
            Slot: 1,
            Capacity: 50,
            ZoneId: Guid.NewGuid(),
            IsActive: true);

        // Act
        var result = _validator.Validate(command);

        // Assert
        result.IsValid.Should().BeTrue();
    }

    [Theory]
    [InlineData(0)]
    [InlineData(-5)]
    public void Validate_SlotLessThanOrEqualZero_ShouldFail(int slot)
    {
        // Arrange
        var command = new CreateBinCommand(
            Description: null,
            AisleId: Guid.NewGuid(),
            Slot: slot,
            Capacity: 50,
            ZoneId: Guid.NewGuid());

        // Act
        var result = _validator.Validate(command);

        // Assert
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == "Slot");
    }

    [Theory]
    [InlineData(0)]
    [InlineData(-1)]
    public void Validate_CapacityLessThanOrEqualZero_ShouldFail(int capacity)
    {
        // Arrange
        var command = new CreateBinCommand(
            Description: null,
            AisleId: Guid.NewGuid(),
            Slot: 1,
            Capacity: capacity,
            ZoneId: Guid.NewGuid());

        // Act
        var result = _validator.Validate(command);

        // Assert
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == "Capacity");
    }

    [Fact]
    public void Validate_CapacityExceeds10000_ShouldFail()
    {
        // Arrange
        var command = new CreateBinCommand(
            Description: null,
            AisleId: Guid.NewGuid(),
            Slot: 1,
            Capacity: 10001,
            ZoneId: Guid.NewGuid());

        // Act
        var result = _validator.Validate(command);

        // Assert
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == "Capacity");
    }

    [Fact]
    public void Validate_EmptyZoneId_ShouldFail()
    {
        // Arrange
        var command = new CreateBinCommand(
            Description: null,
            AisleId: Guid.NewGuid(),
            Slot: 1,
            Capacity: 50,
            ZoneId: Guid.Empty);

        // Act
        var result = _validator.Validate(command);

        // Assert
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == "ZoneId");
    }

    [Fact]
    public void Validate_EmptyAisleId_ShouldFail()
    {
        // Arrange
        var command = new CreateBinCommand(
            Description: null,
            AisleId: Guid.Empty,
            Slot: 1,
            Capacity: 50,
            ZoneId: Guid.NewGuid());

        // Act
        var result = _validator.Validate(command);

        // Assert
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == "AisleId");
    }
}

public class UpdateBinCommandValidatorTests
{
    private readonly UpdateBinCommandValidator _validator = new();

    [Fact]
    public void Validate_ValidCommand_ShouldPass()
    {
        // Arrange
        var command = new UpdateBinCommand(
            Id: Guid.NewGuid(),
            Description: "Test bin",
            AisleId: Guid.NewGuid(),
            Slot: 1,
            Capacity: 50,
            ZoneId: Guid.NewGuid(),
            IsActive: true);

        // Act
        var result = _validator.Validate(command);

        // Assert
        result.IsValid.Should().BeTrue();
    }

    [Fact]
    public void Validate_EmptyId_ShouldFail()
    {
        // Arrange
        var command = new UpdateBinCommand(
            Id: Guid.Empty,
            Description: null,
            AisleId: Guid.NewGuid(),
            Slot: 1,
            Capacity: 50,
            ZoneId: Guid.NewGuid(),
            IsActive: true);

        // Act
        var result = _validator.Validate(command);

        // Assert
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == "Id");
    }

    [Fact]
    public void Validate_CapacityAtBoundary_ShouldPass()
    {
        // Arrange
        var command = new UpdateBinCommand(
            Id: Guid.NewGuid(),
            Description: null,
            AisleId: Guid.NewGuid(),
            Slot: 1,
            Capacity: 10000,
            ZoneId: Guid.NewGuid(),
            IsActive: true);

        // Act
        var result = _validator.Validate(command);

        // Assert
        result.IsValid.Should().BeTrue();
    }

    [Fact]
    public void Validate_EmptyAisleId_ShouldFail()
    {
        // Arrange
        var command = new UpdateBinCommand(
            Id: Guid.NewGuid(),
            Description: null,
            AisleId: Guid.Empty,
            Slot: 1,
            Capacity: 50,
            ZoneId: Guid.NewGuid(),
            IsActive: true);

        // Act
        var result = _validator.Validate(command);

        // Assert
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == "AisleId");
    }
}
