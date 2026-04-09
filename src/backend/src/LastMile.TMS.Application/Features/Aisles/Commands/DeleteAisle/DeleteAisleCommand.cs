using MediatR;

namespace LastMile.TMS.Application.Features.Aisles.Commands.DeleteAisle;

public record DeleteAisleCommand(Guid Id) : IRequest<bool>;
