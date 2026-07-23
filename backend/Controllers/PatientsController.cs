using Microsoft.AspNetCore.Mvc;
using VeraApi.Authorization;
using VeraApi.Data;
using VeraApi.Models;

namespace VeraApi.Controllers;

[Route("api/patients")]
public class PatientsController : CrudControllerBase<Patient, long>
{
    public PatientsController(VeraDbContext db) : base(db) { }
    protected override long GetId(Patient e) => e.PatientId;

    [HttpGet, RequiresPermission(NavPageIds.PatientDirectory, Permission.Read)]
    public override Task<ActionResult<IEnumerable<Patient>>> GetAll() => base.GetAll();

    [HttpGet("{id}"), RequiresPermission(NavPageIds.PatientDirectory, Permission.Read)]
    public override Task<ActionResult<Patient>> GetById(long id) => base.GetById(id);

    [HttpPost, RequiresPermission(NavPageIds.PatientDirectory, Permission.Create)]
    public override Task<ActionResult<Patient>> Create(Patient entity) => base.Create(entity);

    [HttpPut("{id}"), RequiresPermission(NavPageIds.PatientDirectory, Permission.Update)]
    public override Task<IActionResult> Update(long id, Patient entity) => base.Update(id, entity);
}
