namespace VeraApi.DTOs.Patients;

public record AssignPlanRequest(long PatientId, long PlanId, DateTime StartDate);

public record SessionServiceRequest(long ServiceId);
public record SessionProductRequest(long SkuId, int Quantity);
public record PlanSessionRequest(int SessionNumber, string SessionTitle, List<long> ServiceIds, List<SessionProductRequest> Products);
public record CreateTreatmentPlanRequest(string PlanName, string PlanType, int NumberOfSessions, string Frequency, List<PlanSessionRequest> Sessions);

public record RolePermissionRow(int NavPageId, string PageName, string ModuleName, bool CanCreate, bool CanRead, bool CanUpdate, bool CanDelete);
public record UpdateRolePermissionRequest(bool CanCreate, bool CanRead, bool CanUpdate, bool CanDelete);
