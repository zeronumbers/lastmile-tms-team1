using HotChocolate.Types;
using LastMile.TMS.Application.Features.Aisles.Commands.UpdateAisle;

namespace LastMile.TMS.Api.GraphQL.Inputs;

public class UpdateAisleInput : InputObjectType<UpdateAisleCommand>
{
    protected override void Configure(IInputObjectTypeDescriptor<UpdateAisleCommand> descriptor)
    {
        descriptor.Name("UpdateAisleCommandInput");

        descriptor.Field(a => a.Id).Type<NonNullType<UuidType>>();
        descriptor.Field(a => a.Name).Type<NonNullType<StringType>>();
        descriptor.Field(a => a.ZoneId).Type<NonNullType<UuidType>>();
        descriptor.Field(a => a.Order).Type<NonNullType<IntType>>();
        descriptor.Field(a => a.IsActive).Type<NonNullType<BooleanType>>();
    }
}
