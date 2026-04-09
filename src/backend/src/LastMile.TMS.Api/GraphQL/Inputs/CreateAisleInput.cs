using HotChocolate.Types;
using LastMile.TMS.Application.Features.Aisles.Commands.CreateAisle;

namespace LastMile.TMS.Api.GraphQL.Inputs;

public class CreateAisleInput : InputObjectType<CreateAisleCommand>
{
    protected override void Configure(IInputObjectTypeDescriptor<CreateAisleCommand> descriptor)
    {
        descriptor.Name("CreateAisleCommandInput");

        descriptor.Field(a => a.Name).Type<NonNullType<StringType>>();
        descriptor.Field(a => a.ZoneId).Type<NonNullType<UuidType>>();
        descriptor.Field(a => a.Order).Type<IntType>().DefaultValue(0);
        descriptor.Field(a => a.IsActive).DefaultValue(true);
    }
}
