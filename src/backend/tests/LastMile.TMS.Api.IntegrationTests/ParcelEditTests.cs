using System.Text.Json;
using FluentAssertions;

namespace LastMile.TMS.Api.IntegrationTests;

[Collection("Integration")]
public class ParcelEditTests
{
    private readonly IntegrationFixture _fx;

    public ParcelEditTests(IntegrationFixture fx)
    {
        _fx = fx;
    }

    private async Task<Guid> CreateTestParcelAsync()
    {
        var mutation = @"mutation CreateParcel($input: CreateParcelCommandInput!) {
            createParcel(input: $input) { id }
        }";

        var variables = new
        {
            input = new
            {
                description = "Edit test parcel",
                serviceType = "Standard",
                shipperAddress = new
                {
                    street1 = "123 Shipper St",
                    city = "Almaty",
                    state = "Almaty",
                    postalCode = "050000",
                    countryCode = "KZ"
                },
                recipientAddress = new
                {
                    street1 = "456 Recipient Ave",
                    city = "Almaty",
                    state = "Almaty",
                    postalCode = "050000",
                    countryCode = "KZ"
                },
                weight = 1.5,
                weightUnit = "Kg",
                length = 30.0,
                width = 20.0,
                height = 15.0,
                dimensionUnit = "Cm",
                declaredValue = 100.00
            }
        };

        var json = await _fx.GraphQLRequestAsync(mutation, variables);

        if (json.TryGetProperty("errors", out var errors))
        {
            throw new InvalidOperationException($"CreateParcel failed: {errors.GetRawText()}");
        }

        return Guid.Parse(json.GetProperty("data").GetProperty("createParcel").GetProperty("id").GetString()!);
    }

    private async Task<Guid> CreateParcelWithStatusAsync(params string[] statuses)
    {
        var parcelId = await CreateTestParcelAsync();

        var mutation = @"mutation ChangeStatus($input: ChangeParcelStatusCommandInput!) {
            changeParcelStatus(input: $input) { id }
        }";

        foreach (var status in statuses)
        {
            var variables = new
            {
                input = new
                {
                    id = parcelId.ToString(),
                    newStatus = status
                }
            };

            var json = await _fx.GraphQLRequestAsync(mutation, variables);

            if (json.TryGetProperty("errors", out var errors))
            {
                throw new InvalidOperationException($"ChangeParcelStatus to {status} failed: {errors.GetRawText()}");
            }
        }

        return parcelId;
    }

    #region UpdateParcel Tests

    [Fact]
    public async Task UpdateParcel_ShipperAddress_ShouldUpdateAddressInPlace()
    {
        // Arrange
        var parcelId = await CreateTestParcelAsync();

        var mutation = $@"mutation {{
            updateParcel(input: {{
                id: ""{parcelId}"",
                shipperAddress: {{
                    street1: ""789 New Shipper Blvd"",
                    street2: ""Apt 5"",
                    city: ""Almaty"",
                    state: ""Almaty"",
                    postalCode: ""050001"",
                    countryCode: ""KZ"",
                    isResidential: false,
                    contactName: ""New Shipper Contact"",
                    companyName: ""New Shipper Co"",
                    phone: ""+77771234567"",
                    email: ""newshipper@example.com""
                }}
            }}) {{
                id
                shipperAddress {{
                    id
                    street1
                    city
                    postalCode
                }}
            }}
        }}";

        // Act
        var jsonResponse = await _fx.GraphQLRequestAsync(mutation);

        // Assert
        if (jsonResponse.TryGetProperty("errors", out var errors))
        {
            throw new Exception($"Update failed: {errors.GetRawText()}");
        }

        var result = jsonResponse.GetProperty("data").GetProperty("updateParcel");
        var address = result.GetProperty("shipperAddress");
        address.GetProperty("street1").GetString().Should().Be("789 New Shipper Blvd");
        address.GetProperty("city").GetString().Should().Be("Almaty");
        address.GetProperty("postalCode").GetString().Should().Be("050001");
    }

    [Fact]
    public async Task UpdateParcel_RecipientAddress_ShouldUpdateAddressInPlace()
    {
        // Arrange
        var parcelId = await CreateTestParcelAsync();

        var mutation = $@"mutation {{
            updateParcel(input: {{
                id: ""{parcelId}"",
                recipientAddress: {{
                    street1: ""999 New Recipient Way"",
                    city: ""Almaty"",
                    state: ""Almaty"",
                    postalCode: ""050002"",
                    countryCode: ""KZ"",
                    isResidential: true,
                    contactName: ""New Recipient Person"",
                    phone: ""+77779876543""
                }}
            }}) {{
                id
                recipientAddress {{
                    id
                    street1
                    contactName
                    postalCode
                }}
            }}
        }}";

        // Act
        var jsonResponse = await _fx.GraphQLRequestAsync(mutation);

        // Assert
        if (jsonResponse.TryGetProperty("errors", out var errors))
        {
            throw new Exception($"Update failed: {errors.GetRawText()}");
        }

        var result = jsonResponse.GetProperty("data").GetProperty("updateParcel");
        var address = result.GetProperty("recipientAddress");
        address.GetProperty("street1").GetString().Should().Be("999 New Recipient Way");
        address.GetProperty("contactName").GetString().Should().Be("New Recipient Person");
    }

    [Fact]
    public async Task UpdateParcel_WithValidData_OnRegisteredParcel_ShouldUpdateAndLogChanges()
    {
        // Arrange
        var parcelId = await CreateTestParcelAsync();

        var mutation = $@"mutation {{
            updateParcel(input: {{
                id: ""{parcelId}"",
                description: ""UPDATED - Registered Parcel"",
                weight: 2.5,
                length: 35,
                width: 25,
                height: 20,
                parcelType: PACKAGE
            }}) {{
                id
                trackingNumber
                status
                description
                weight
            }}
        }}";

        // Act
        var jsonResponse = await _fx.GraphQLRequestAsync(mutation);

        // Assert
        if (jsonResponse.TryGetProperty("errors", out var errors))
        {
            throw new Exception($"Update failed: {errors.GetRawText()}");
        }

        var result = jsonResponse.GetProperty("data").GetProperty("updateParcel");
        result.GetProperty("description").GetString().Should().Be("UPDATED - Registered Parcel");
        result.GetProperty("weight").GetDecimal().Should().Be(2.5m);
    }

    [Fact]
    public async Task UpdateParcel_OnSortedParcel_ShouldSucceed()
    {
        // Arrange - Registered → ReceivedAtDepot → Sorted
        var parcelId = await CreateParcelWithStatusAsync("RECEIVED_AT_DEPOT", "SORTED");

        var mutation = $@"mutation {{
            updateParcel(input: {{
                id: ""{parcelId}"",
                description: ""Should this work?"",
                weight: 2.5,
                length: 35,
                width: 25,
                height: 20,
                parcelType: PACKAGE
            }}) {{
                id
                description
            }}
        }}";

        // Act
        var jsonResponse = await _fx.GraphQLRequestAsync(mutation);

        // Assert
        jsonResponse.TryGetProperty("errors", out var errors).Should().BeFalse("Update should succeed for Sorted status");
    }

    [Fact]
    public async Task UpdateParcel_OnLoadedParcel_ShouldFail()
    {
        // Arrange - Registered → ReceivedAtDepot → Sorted → Staged → Loaded
        var parcelId = await CreateParcelWithStatusAsync("RECEIVED_AT_DEPOT", "SORTED", "STAGED", "LOADED");

        var mutation = $@"mutation {{
            updateParcel(input: {{
                id: ""{parcelId}"",
                description: ""Should this work?"",
                weight: 2.5,
                length: 35,
                width: 25,
                height: 20,
                parcelType: PACKAGE
            }}) {{
                id
                description
            }}
        }}";

        // Act
        var jsonResponse = await _fx.GraphQLRequestAsync(mutation);

        // Assert
        jsonResponse.TryGetProperty("errors", out var errors).Should().BeTrue("Update should fail for Loaded status");
        errors[0].GetProperty("message").GetString().Should().Contain("Cannot edit parcel in status");
    }

    [Fact]
    public async Task UpdateParcel_WithInvalidWeight_ShouldReturnValidationError()
    {
        // Arrange
        var parcelId = await CreateTestParcelAsync();

        var mutation = $@"mutation {{
            updateParcel(input: {{
                id: ""{parcelId}"",
                weight: -1.5,
                length: 35,
                width: 25,
                height: 20,
                serviceType: STANDARD
            }}) {{
                id
            }}
        }}";

        // Act
        var jsonResponse = await _fx.GraphQLRequestAsync(mutation);

        // Assert
        jsonResponse.TryGetProperty("errors", out var errors).Should().BeTrue();
        errors[0].GetProperty("message").GetString().Should().Contain("Weight");
    }

    #endregion

    #region CancelParcel Tests

    [Fact]
    public async Task CancelParcel_WhenRegistered_ShouldCancel()
    {
        // Arrange
        var parcelId = await CreateTestParcelAsync();

        var mutation = $@"mutation {{
            cancelParcel(input: {{
                id: ""{parcelId}"",
                reason: ""Customer requested cancellation""
            }}) {{
                id
                trackingNumber
                status
            }}
        }}";

        // Act
        var jsonResponse = await _fx.GraphQLRequestAsync(mutation);

        // Assert
        if (jsonResponse.TryGetProperty("errors", out var errors))
        {
            throw new Exception($"Cancel failed for Registered: {errors.GetRawText()}");
        }

        var result = jsonResponse.GetProperty("data").GetProperty("cancelParcel");
        result.GetProperty("status").GetString().Should().Be("CANCELLED");
    }

    [Fact]
    public async Task CancelParcel_WhenSorted_ShouldCancel()
    {
        // Arrange - Registered → ReceivedAtDepot → Sorted
        var parcelId = await CreateParcelWithStatusAsync("RECEIVED_AT_DEPOT", "SORTED");

        var mutation = $@"mutation {{
            cancelParcel(input: {{
                id: ""{parcelId}"",
                reason: ""Customer requested cancellation""
            }}) {{
                id
                trackingNumber
                status
            }}
        }}";

        // Act
        var jsonResponse = await _fx.GraphQLRequestAsync(mutation);

        // Assert
        if (jsonResponse.TryGetProperty("errors", out var errors))
        {
            throw new Exception($"Cancel failed for Sorted: {errors.GetRawText()}");
        }

        var result = jsonResponse.GetProperty("data").GetProperty("cancelParcel");
        result.GetProperty("status").GetString().Should().Be("CANCELLED");
    }

    [Fact]
    public async Task CancelParcel_WhenLoaded_ShouldReturnError()
    {
        // Arrange - Registered → ReceivedAtDepot → Sorted → Staged → Loaded
        var parcelId = await CreateParcelWithStatusAsync("RECEIVED_AT_DEPOT", "SORTED", "STAGED", "LOADED");

        var mutation = $@"mutation {{
            cancelParcel(input: {{
                id: ""{parcelId}"",
                reason: ""Test cancellation""
            }}) {{
                id
                status
            }}
        }}";

        // Act
        var jsonResponse = await _fx.GraphQLRequestAsync(mutation);

        // Assert
        jsonResponse.TryGetProperty("errors", out var errors).Should().BeTrue("Cancel should fail for Loaded status");
        errors[0].GetProperty("message").GetString().Should().Contain("Cannot cancel parcel");
    }

    [Fact]
    public async Task CancelParcel_WithoutReason_ShouldReturnValidationError()
    {
        // Arrange
        var parcelId = await CreateTestParcelAsync();

        var mutation = $@"mutation {{
            cancelParcel(input: {{
                id: ""{parcelId}""
            }}) {{
                id
            }}
        }}";

        // Act
        var jsonResponse = await _fx.GraphQLRequestAsync(mutation);

        // Assert
        jsonResponse.TryGetProperty("errors", out var errors).Should().BeTrue();
        var errorMessage = errors[0].GetProperty("message").GetString();
        errorMessage.Should().Match("*eason*");
    }

    [Fact]
    public async Task CancelParcel_ShouldCreateAuditLogWithReason()
    {
        // Arrange
        var parcelId = await CreateTestParcelAsync();
        var reason = "Customer requested cancellation";
        var mutation = $@"mutation {{
            cancelParcel(input: {{
                id: ""{parcelId}"",
                reason: ""{reason}""
            }}) {{
                id
                status
            }}
        }}";

        // Act
        await _fx.GraphQLRequestAsync(mutation);

        // Query audit logs
        var query = $@"query {{
            parcelAuditLogs(parcelId: ""{parcelId}"") {{
                nodes {{
                    propertyName
                    oldValue
                    newValue
                    changedBy
                    createdAt
                }}
            }}
        }}";

        var jsonResponse = await _fx.GraphQLRequestAsync(query);

        // Assert
        if (jsonResponse.TryGetProperty("errors", out var errors))
        {
            throw new Exception($"Query failed: {errors.GetRawText()}");
        }

        var auditLogs = jsonResponse.GetProperty("data").GetProperty("parcelAuditLogs").GetProperty("nodes");
        auditLogs.GetArrayLength().Should().BeGreaterThan(0);

        var statusAuditLog = auditLogs.EnumerateArray()
            .FirstOrDefault(log => log.GetProperty("propertyName").GetString() == "Status");

        statusAuditLog.Should().NotBeNull();
        statusAuditLog.GetProperty("oldValue").GetString().Should().Be("Registered");
        statusAuditLog.GetProperty("newValue").GetString().Should().Be($"Cancelled - {reason}");
        statusAuditLog.GetProperty("changedBy").GetString().Should().NotBeNullOrEmpty();
    }

    #endregion

    #region Audit Log Tests

    [Fact]
    public async Task UpdateParcel_ShouldCreateAuditLogEntries()
    {
        // Arrange
        var parcelId = await CreateTestParcelAsync();
        var mutation = $@"mutation {{
            updateParcel(input: {{
                id: ""{parcelId}"",
                description: ""AUDIT TEST - Updated Description"",
                weight: 3.5,
                length: 40,
                width: 30,
                height: 25,
                serviceType: EXPRESS,
                parcelType: ENVELOPE
            }}) {{
                id
            }}
        }}";

        // Act
        await _fx.GraphQLRequestAsync(mutation);

        // Query audit logs
        var query = $@"query {{
            parcelAuditLogs(parcelId: ""{parcelId}"") {{
                nodes {{
                    propertyName
                    oldValue
                    newValue
                    changedBy
                    createdAt
                }}
            }}
        }}";

        var jsonResponse = await _fx.GraphQLRequestAsync(query);

        // Assert
        if (jsonResponse.TryGetProperty("errors", out var errors))
        {
            throw new Exception($"Query failed: {errors.GetRawText()}");
        }

        var auditLogs = jsonResponse.GetProperty("data").GetProperty("parcelAuditLogs").GetProperty("nodes");
        auditLogs.GetArrayLength().Should().BeGreaterThan(0);

        var loggedProperties = new HashSet<string>();
        foreach (var log in auditLogs.EnumerateArray())
        {
            loggedProperties.Add(log.GetProperty("propertyName").GetString()!);
        }

        loggedProperties.Should().Contain("Description");
        loggedProperties.Should().Contain("Weight");
        loggedProperties.Should().Contain("ServiceType");
    }

    #endregion
}
