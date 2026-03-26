using HotChocolate;
using HotChocolate.Execution;

namespace LastMile.TMS.Api.GraphQL;

public class ErrorFilter : IErrorFilter
{
    public IError OnError(IError error)
    {
        if (error.Exception is not null)
        {
            return error.WithMessage(error.Exception.Message);
        }

        return error;
    }
}
